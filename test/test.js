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
    await img.batch(
        [img.colorize, "#0da000", 0.5],
        [img.saturate, 2],
        img.reverse,
    );
    console.timeEnd(time);
    scene
        .add(img)
        .render();
});
