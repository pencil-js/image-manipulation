export default ({ OffScreenCanvas, Color, Image }) => {
    const sandbox = OffScreenCanvas.getDrawingContext();

    async function eachPixel (callback) {
        if (!this.isLoaded) {
            return Promise.resolve();
        }

        sandbox.canvas.width = this.width;
        sandbox.canvas.height = this.height;
        this.setContext(sandbox);
        this.draw(sandbox);
        const imageData = sandbox.getImageData(0, 0, this.width, this.height);
        const { data } = imageData;
        for (let i = 0, l = data.length; i < l; i += 4) {
            const replace = callback(new Color(...[...data.slice(i, i + 4)].map(value => value / 255)));
            const array = replace.array.concat(replace.alpha).map(value => value * 255);
            for (let r = 0; r < 4; ++r) {
                data[i + r] = array[r] || data[i + r];
            }
        }
        sandbox.putImageData(imageData, 0, 0);
        this.file = await Image.load(sandbox.canvas.toDataURL());
        return this;
    }

    const funcMap = new Map();
    const actionToFunc = {};

    function getFunction (action) {
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

    function batch (...transforms) {
        const functions = transforms.map(func => (Array.isArray(func) ?
            funcMap.get(func[0])(...func.slice(1)) :
            funcMap.get(func)()));
        return this.eachPixel((pixel) => {
            functions.forEach(func => func(pixel));
            return pixel;
        });
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
    };
};
