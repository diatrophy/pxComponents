// border2.js
// post-effect
// draws a border as a series a rectangles around the image

// TODO - use to callbackList to resize the rectangles depending on the size of the image,
// rather than the container

module.exports =  function(scene,uiImage,callbackList) {

    var effects = uiImage.effects.effects

    scene.create({       // create a rectangle to simulate a border
        t:"rect",
        w:effects['border2'].lPadding,
        h:uiImage['container'].h,
        parent:uiImage['container'],
        fillColor:effects['border2'].borderColor,
        a:1})

    scene.create({       // create a rectangle to simulate a border
        t:"rect",
        x:uiImage['container'].w,
        w:effects['border2'].rPadding,
        h:uiImage['container'].h,
        parent:uiImage['container'],
        fillColor:effects['border2'].borderColor,
        a:1})

    scene.create({       // create a rectangle to simulate a border
        t:"rect",
        h:effects['border2'].tPadding,
        w:uiImage['container'].w,
        parent:uiImage['container'],
        fillColor:effects['border2'].borderColor,
        a:1})

    scene.create({       // create a rectangle to simulate a border
        t:"rect",
        y:uiImage['container'].h,
        h:effects['border2'].tPadding,
        w:uiImage['container'].w,
        parent:uiImage['container'],
        fillColor:effects['border2'].borderColor,
        a:1})
}

