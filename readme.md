# @pencil.js/image-manipulation


## Installation

    npm install @pencil.js/image-manipulation


## Usage

```js
import { use, Image } from "pencil.js";
import manipulation from "@pencil.js/image-manipulation";

use(manipulation);

const image = new Image(position, url);

// One manipulation
(async () => {
    await image.reverse();
    console.log("Done");
})();

// Multiple manipulation (done in parallel)
(async () => {
    await image.batch(
        image.reverse,
        [image.lighten, 0.7],
    );
    console.log("Done");
})();
```


## [Documentation](documentation.md)


## License

[MIT](license)
