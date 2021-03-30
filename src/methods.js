export default ({ OffScreenCanvas, Color, Image }) => {
    const sandbox = OffScreenCanvas.getDrawingContext();

    /**
     * @callback EachPixelCallback
     * @param {Color} color - Color of the pixel
     * @param {Number} index - Index of the pixel (from left to right, top to bottom)
     */
    /**
     * Browse each pixel on the image and apply some transformation
     * @param {EachPixelCallback} callback - Function called on each pixel
     * @return {Promise<Image>} Itself when done
     */
    async function eachPixel (callback) {
        if (!this.isLoaded) {
            return this;
        }

        sandbox.canvas.width = this.width;
        sandbox.canvas.height = this.height;
        this.draw(sandbox);

        const imageData = sandbox.getImageData(0, 0, this.width, this.height);
        const { data } = imageData;
        for (let i = 0, l = data.length; i < l; i += 4) {
            const replace = callback(new Color(...[...data.slice(i, i + 4)].map(value => value / 255)), i / 4);
            const array = replace.array.concat(replace.alpha).map(value => value * 255);
            for (let r = 0; r < 4; ++r) {
                data[i + r] = array[r] || data[i + r];
            }
        }
        sandbox.putImageData(imageData, 0, 0);

        this.file = await Image.load(sandbox.canvas.toDataURL());
        return this;
    }

    /**
     * Merge multiple image on top of each other
     * @param {...Image} image - Another image to paint on top
     * @return {Promise<Image>} Itself when done
     */
    async function merge (...image) {
        if (!this.isLoaded) {
            return this;
        }

        sandbox.canvas.width = this.width;
        sandbox.canvas.height = this.height;
        this.draw(sandbox);

        image.forEach((one) => {
            if (one.isLoaded) {
                sandbox.save();
                sandbox.translate(one.position.x, one.position.y);
                one.setContext(sandbox);
                const origin = one.getOrigin();
                sandbox.translate(origin.x, origin.y);
                one.draw(sandbox);
                sandbox.restore();
            }
        });

        this.file = await Image.load(sandbox.canvas.toDataURL());
        return this;
    }

    const funcMap = new Map();
    const actionToFunc = {};

    /**
     * Prepare a function to execute on each pixels
     * @param {String} action - Name of this function for storage
     * @return {function(...[*]=): Promise<Image>}
     */
    function getFunction (action) {
        /**
         * Function that run on each pixel
         * @param {...*} [params] - Additional parameters
         * @return {Promise<Image>}
         */
        function fn (...params) {
            return this.eachPixel(funcMap.get(actionToFunc[action])(...params));
        }
        Object.defineProperty(fn, "name", {
            value: action,
            writable: false,
            enumerable: false,
            configurable: true,
        });
        actionToFunc[action] = fn;
        return fn;
    }

    const grey = getFunction("grey");
    const reverse = getFunction("reverse");
    const level = getFunction("level");
    const colorize = getFunction("colorize");
    const saturate = getFunction("saturation");
    const rotate = getFunction("rotate");
    const lighten = getFunction("lighten");

    funcMap.set(grey, () => pixel => pixel.grey());
    funcMap.set(reverse, () => pixel => pixel.reverse());
    funcMap.set(level, number => pixel => pixel.level(number));
    funcMap.set(colorize, (color, ratio) => pixel => pixel.lerp(color, ratio));
    funcMap.set(saturate, value => pixel => pixel.saturation(value));
    funcMap.set(rotate, value => pixel => pixel.hue(value));
    funcMap.set(lighten, value => pixel => pixel.lightness(value));

    /**
     * Run multiple pixel transformation in parallel
     * @param {...Function|Array<Function, *>} transform - Function to execute on each pixel, you can pass argument to this function by wrapping it in an array
     * @return {Promise<Image>} Itself when done
     * @example image.batch(image.grey, [image.colorize, "red", 0.5]);
     */
    function batch (...transform) {
        const functions = transform.map(func => (Array.isArray(func) ?
            funcMap.get(func[0])(...func.slice(1)) :
            funcMap.get(func)()));
        return this.eachPixel(pixel => functions.reduce((pix, func) => func(pix), pixel));
    }

    return {
        eachPixel,
        batch,
        grey,
        reverse,
        level,
        colorize,
        saturate,
        rotate,
        lighten,
        merge,
    };
};
