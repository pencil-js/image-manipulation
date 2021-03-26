import methods from "./methods.js";

export default {
    name: "image-manipulation",
    install: (Pencil) => {
        const toAdd = methods(Pencil);
        Object.keys(toAdd).forEach((name) => {
            Pencil.Image.prototype[name] = toAdd[name];
        });
    },
};
