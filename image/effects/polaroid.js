// polaroid.js
// pre-effect

// from wikipedia - 
// Instant film is available in sizes from 24 mm × 36 mm (similar to 135 film) up to 50.8 cm × 61 cm size, 
// with the most popular film sizes for consumer snapshots being approximately 83mm × 108mm (the image 
// itself is smaller as it is surrounded by a border).

px.import({
  constants:'constants.js'
}).then(function importsAreReady(imports) {

    var constants = imports.constants

    module.exports =  function(scene,uiImage,callbackList) {

        var polaroid = scene.create({       // create a rectangle to simulate a polaroid
            t:"rect",
            parent:uiImage['container'],
            fillColor:0xF8F8F8FF,
            lineColor:0xCCCCCC80,
            a:0,
            lineWidth:4})   

        uiImage["polaroid"] = polaroid

        var effects = uiImage.effects.effects

        var polaroidWidth = effects['polaroid'].w

        uiImage.container.sx = uiImage.container.sy = 1
        uiImage.container.w = polaroid.w = polaroidWidth 
        uiImage.container.h = polaroid.h = effects['polaroid'].h

        var sidePadding = effects['polaroid'].sidePadding
        var topPadding = effects['polaroid'].topPadding
        var bottomPadding = effects['polaroid'].bottomPadding

        var cropper = scene.create({ t:"rect",parent:uiImage['container'], clip:true,a:1 }) 
        uiImage['cropper'] = cropper
        cropper.y += effects['polaroid'].topPadding
        cropper.x = sidePadding          
        cropper.h = uiImage.container.h - topPadding - bottomPadding
        cropper.w = uiImage.container.w - (sidePadding * 2)

        // register a callback to re-size the polaroid frame after the image has been rendered
        callbackList.push(function (uiImage,scale){

            var readyImage = uiImage.image
   
            readyImage.parent = cropper

            if (readyImage.resource.w >= readyImage.resource.h) {

                // scale and crop across height
                readyImage.h = cropper.h

                // now need to determine how much more to scale
                readyImage.w = Math.round(readyImage.h * readyImage.resource.w / readyImage.resource.h)
                readyImage.x = -Math.round(((readyImage.w - uiImage.container.w) / 2 )) - sidePadding
                
            } else {

                // scale and crop across width
                readyImage.w = cropper.w

                // now need to determine how much more to scale
                readyImage.h = Math.round(readyImage.w * readyImage.resource.h / readyImage.resource.w)
                readyImage.y = -Math.round(((readyImage.h - uiImage.container.h) / 2 )) - topPadding                   
            }

            // 1:17:1

            // 40/60 border top ratio
            // 40/160 border bottom ratio
            // 682/552 image

            polaroid.a = 1          // make the polaroid effect visible
        })    
    }
})
