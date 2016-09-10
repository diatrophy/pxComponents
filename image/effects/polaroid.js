// polaroid.js
// pre-effect

// from wikipedia - 
// Instant film is available in sizes from 24 mm × 36 mm (similar to 135 film) up to 50.8 cm × 61 cm size, 
// with the most popular film sizes for consumer snapshots being approximately 83mm × 108mm (the image 
// itself is smaller as it is surrounded by a border).
//
// 1:17:1
//
// 40/60 border top ratio
// 40/160 border bottom ratio
// 682/552 image

module.exports = function (scene, uiImage, callbackList) {

    var effects = uiImage.effects.effects,
        sidePadding = effects['polaroid'].sidePadding,
        topPadding = effects['polaroid'].topPadding,
        bottomPadding = effects['polaroid'].bottomPadding,
        captions = effects['polaroid'].captions
        
        
    var captionFont;
    var caption;
    if( captions !== undefined && captions == true) 
      captionFont = scene.create({t:"fontResource", url:"http://pxscene.org/examples/px-reference/fonts/DancingScript-Regular.ttf"});

    // create a rectangle to simulate a polaroid
    uiImage["polaroid"] = scene.create({
        t: "rect",
        parent: uiImage['container'],
        fillColor: 0xF8F8F8FF,
        lineColor: 0xCCCCCC80,
        a: 0,
        lineWidth: 4,
        w: effects['polaroid'].w,
        h: effects['polaroid'].h
    })

    // update the container w/h to match that of the polaroid
    uiImage.container.w = uiImage['polaroid'].w
    uiImage.container.h = uiImage['polaroid'].h

    // create an rectangle object (with clip = true) that will crop the actual image
    var cropper = scene.create({
        t: "rect",
        parent: uiImage['container'],
        clip: true,
        a: 1,
        y: topPadding,
        x: sidePadding,
        h: uiImage.container.h - topPadding - bottomPadding,
        w: uiImage.container.w - (sidePadding * 2)
    })
    uiImage['cropper'] = cropper
    
    if( captions !== undefined && captions == true) {
      caption = scene.create({
          t: "textBox",
          parent: uiImage['polaroid'],
          clip: true,
          a: 1,
          y: effects['polaroid'].h - bottomPadding +5,
          x: sidePadding,
          h: bottomPadding - 20,
          w: uiImage.container.w - (sidePadding * 2),
          text:uiImage.config.caption,
          textColor:0x000000FF,
          alignHorizontal:scene.alignHorizontal.CENTER,
          font:captionFont,
          pixelSize:22,
          wordWrap:true,
          truncation:scene.truncation.TRUNCATE_AT_WORD,
          ellipsis:true
      })
    }

    // register a callback to re-size the image after the image resource has been downloaded
    // and available / rendered
    callbackList.push(function (uiImage, scale) {

        var readyImage = uiImage.image,
            imgWH = { w: readyImage.w, h: readyImage.h }

        // use the width and height from the image resource if available
        if (readyImage.resource != null)
            imgWH = { w: readyImage.resource.w, h: readyImage.resource.h }

        // we change the image's parent to be the cropper, so that the image gets cropped via association
        // with parent
        readyImage.parent = cropper
        readyImage.stretchX = readyImage.stretchY = 1

        // if the width of the image is greater or equal than the height then we need to 
        // scale and crop across height, otherwise we scale across the width
        if (imgWH.w >= imgWH.h) {

            readyImage.h = cropper.h

            // now need to determine how much more to scale
            readyImage.w = Math.round(readyImage.h * imgWH.w / imgWH.h)
            readyImage.x = -Math.round(((readyImage.w - uiImage.container.w) / 2)) - sidePadding

        } else {

            readyImage.w = cropper.w

            // now need to determine how much more to scale
            readyImage.h = Math.round(readyImage.w * imgWH.h / imgWH.w)
            readyImage.y = -Math.round(((readyImage.h - uiImage.container.h) / 2)) - topPadding
        }

        uiImage["polaroid"].a = 1          // make the polaroid effect visible
    })
}

