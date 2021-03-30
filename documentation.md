# Documentation

## Methods

## Shorthands

- `.grey()`
- `.reverse()`
- `.level(<Number>)`
- `.colorize(<Color> targetColor, <Number> ratioToColor)`
- `.saturate(<Number>saturationValue)`
- `.rotate(<Number>hueValue)`
- `.lighten(<Number>lightnessValue)`


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
        .lerp("red", 0.5);
});
```


### `.batch`

Run multiple pixel transformation in parallel.

| Name | Type | Default | Comment |
| ---- | ---- | ------- | ------- |
|transform |`Function` or `[Function, ...*]` |- |Function to execute on each pixel, you can pass argument to this function by wrapping it in an array |

```js
await image.batch(
    image.grey,
    [image.colorize, "red", 0.5],
);
```
