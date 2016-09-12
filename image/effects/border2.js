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
    var topConfig = getTopConfig()
    if (uiImage['border2.top'] != null) {
        uiImage['border2.top'].w = topConfig.w
        uiImage['border2.top'].h = topConfig.h
    } else {
        if (topConfig.h != 0) {
            uiImage['border2.top'] = scene.create(topConfig)
        }
    }

    // create a rectangle to simulate a border (BOTTOM)
    var bottomConfig = topConfig
    bottomConfig.y = uiImage['container'].h - effects['border2'].bPadding // ensure that the border is inset
    bottomConfig.h = effects['border2'].bPadding
    if (uiImage['border2.bottom'] != null) {
        uiImage['border2.bottom'].w = bottomConfig.w
        uiImage['border2.bottom'].h = bottomConfig.h
        uiImage['border2.bottom'].y = bottomConfig.y
    } else 
        uiImage['border2.bottom'] = scene.create(bottomConfig)

    // create a rectangle to simulate a border (LEFT)
    var leftConfig = getLeftConfig()
    if (uiImage['border2.left'] != null) {
        uiImage['border2.left'].h = leftConfig.h
        uiImage['border2.left'].w = leftConfig.w
    } else {
        if (leftConfig.w != 0)
            uiImage['border2.left'] = scene.create(leftConfig)
    }

    // create a rectangle to simulate a border (RIGHT)
    var rightConfig = leftConfig
    rightConfig.x = uiImage['container'].w - effects['border2'].rPadding // ensure that the border is inset
    rightConfig.w = effects['border2'].rPadding

    if ( uiImage['border2.right'] != null) {
        uiImage['border2.right'].x = rightConfig.x
        uiImage['border2.right'].w = rightConfig.w
        uiImage['border2.right'].h = rightConfig.h
    } else 
        uiImage['border2.right'] = scene.create(rightConfig)
}

