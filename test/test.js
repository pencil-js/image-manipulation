import manip from "../src/index.js";
import "../node_modules/pencil.js/dist/pencil.min.js";
const { Scene, Image, use } = Pencil;

use(manip);

const scene = new Scene(undefined, {
    fill: "#158848",
});

const img = new Image([40, 10], "cat.png", {
    stroke: "#000",
    stokeWidth: 2,
});

img.on("ready", async () => {
    const time = "Edit";
    console.time(time);
    const over = new Image([img.width / 2, img.height / 2], img.file, {
        origin: "center",
        scale: [-0.5, 0.5],
        opacity: 0.7,
    });
    await img.colorize("red", 0.6);
    await over.eachPixel(pixel => pixel.grey());
    await img.merge(over);
    console.timeEnd(time);
    scene
        .add(img)
        .render();
});
