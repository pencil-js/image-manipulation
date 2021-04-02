export default ({ OffScreenCanvas, Color, Image }) => {
    const sandbox = OffScreenCanvas.getDrawingContext();

    function draw (image) {
        sandbox.canvas.width = image.width;
        sandbox.canvas.height = image.height;
        image.draw(sandbox);
    }

    async function loadDataUrl (image) {
        image.file = await Image.load(sandbox.canvas.toDataURL());
    }

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

        draw(this);

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

        await loadDataUrl(this);
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

        draw(this);

        image.forEach((one) => {
            if (one.isLoaded) {
                sandbox.save();
                sandbox.translate(one.position.x, one.position.y);
                one.setContext(sandbox);
                one.constructor.setOpacity(sandbox, one.options.opacity);
                const origin = one.getOrigin();
                sandbox.translate(origin.x, origin.y);
                one.draw(sandbox);
                sandbox.restore();
            }
        });

        await loadDataUrl(this);
        return this;
    }

    /**
     * Add a color on top of the image
     * @param {Color|String} color - Pencil.js Color instance or valid CSS color string
     * @param {Image} ratio - Number between 0 and 1
     * @return {Promise<Image>} Itself when done
     */
    async function colorize (color, ratio = 1) {
        if (!this.isLoaded) {
            return this;
        }

        draw(this);

        sandbox.globalCompositeOperation = "multiply";
        sandbox.globalAlpha = ratio;
        sandbox.fillStyle = color.toString();
        sandbox.fillRect(0, 0, this.width, this.height);

        await loadDataUrl(this);
        return this;
    }

    return {
        eachPixel,
        merge,
        colorize,
    };
};
