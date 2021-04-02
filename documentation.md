# Documentation

## Methods

### `.eachPixel`

Browse each pixel on the image and apply some transformation

| Name | Type | Default | Comment |
| ---- | ---- | ------- | ------- |
|callback |`Function` |- |Function called on each pixel |

```js
await image.eachPixel((pixelColor, index) => {
    console.log(pixelColor); // => {Color} current pixel color
    console.log(index); // => {Number} current pixel index (from left to right, top to bottom)
    pixelColor
        .grey()
        .saturation(1);
});
```

### `.merge`

Merge multiple image on top of each other

| Name | Type | Default | Comment |
| ---- | ---- | ------- | ------- |
|image |`...Image` |- |Another image to paint on top |

```js
await image.merge(layer1, layer2, layer3);
```


### `.colorize`

Add a color on top of the image

| Name | Type | Default | Comment |
| ---- | ---- | ------- | ------- |
|color |`Color` ou `String` |- |Pencil.js Color instance or valid CSS color string |
|ratio |`Number` |`1` |Number between 0 and 1 |

```js
await image.colorize("red", 0.5);
```
