// border2.js
// post-effect
// draws a border as a series a rectangles around the image

// TODO - use to callbackList to resize the rectangles depending on the size of the image,
// rather than the container

module.exports = function (scene, uiImage, callbackList) {

    var effects = uiImage.effects.effects

    var getTopConfig = function () {
        return {
            t: "rect",
            w: uiImage['container'].w,
            h: effects['border2'].tPadding,
            parent: uiImage['container'],
            fillColor: effects['border2'].borderColor,
            a: 1
        }
    }

    var getLeftConfig = function () {
        return {
            t: "rect",
            h: uiImage['container'].h,
            w: effects['border2'].lPadding,
            parent: uiImage['container'],
            fillColor: effects['border2'].borderColor,
            a: 1
        }
    }

    // create a rectangle to simulate a border (TOP)
    scene.create(getTopConfig())

    // create a rectangle to simulate a border (BOTTOM)
    var bottomConfig = getTopConfig()
    bottomConfig.y = uiImage['container'].h - effects['border2'].bPadding // ensure that the border is inset
    bottomConfig.h = effects['border2'].bPadding
    scene.create(bottomConfig)

    // create a rectangle to simulate a border (LEFT)
    scene.create(getLeftConfig())

    // create a rectangle to simulate a border (RIGHT)
    var rightConfig = getLeftConfig()
    rightConfig.x = uiImage['container'].w - effects['border2'].rPadding // ensure that the border is inset
    rightConfig.w = effects['border2'].rPadding
    scene.create(rightConfig)

}

