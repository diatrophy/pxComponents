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

        // register a callback to re-size the polaroid frame after the image has been rendered
        callbackList.push(function(uiImage,scale){

            var readyImage = uiImage.image

            uiImage.container.sx = uiImage.container.sy = 1
            uiImage.container.w = polaroid.w = polaroidWidth 
            uiImage.container.h = polaroid.h = polaroid.w * 1.24415204678363 

            // uiImage.image.w = 200
            uiImage.image.h = 300
           
            var sidePadding = polaroid.w/17
            var topPadding = sidePadding * (3/2)
            var bottomPadding = sidePadding * 4

            uiImage['polaroidSidePadding'] = sidePadding
            uiImage['polaroidTopPadding'] = topPadding
            uiImage['polaroidBottomPadding'] = bottomPadding

            var cropper = scene.create({ t:"rect",parent:uiImage['container'], clip:true,a:1 }) 
            readyImage.parent = cropper

            // readyImage.x += sidePadding
            cropper.y += topPadding

            if (readyImage.resource.w >= readyImage.resource.h) {

                // scale and crop across height
                var origH = readyImage.h
                cropper.h = readyImage.h = uiImage.container.h - topPadding - bottomPadding

                // now need to determine how much more to scale
                readyImage.w = readyImage.h * readyImage.resource.w / readyImage.resource.h
                readyImage.x = -((readyImage.w - uiImage.container.w) / 2 ) - sidePadding
                cropper.x = sidePadding          

                cropper.w = uiImage.container.w - (sidePadding * 2)

            } else {

                // scale and crop across width
                var origW = readyImage.w
                cropper.w = readyImage.w = uiImage.container.w - (2 * sidePadding)

                // now need to determine how much more to scale
                readyImage.h = readyImage.w * readyImage.resource.h / readyImage.resource.w
                readyImage.y = -((readyImage.h - uiImage.container.h) / 2 ) - topPadding
                cropper.x = sidePadding               
               
                cropper.h = uiImage.container.h - topPadding - bottomPadding 
            }

console.log(scale)
// uiImage.container.sx = uiImage.container.sy = 0.25

// scale along width

// 1:17:1

// 40/60 border top ratio
// 40/160 border bottom ratio
// 682/552 image

            // polaroid is scaled to match the scale of the rendered image
            // polaroid.x = -1 * sidePadding
            // polaroid.w += w + (2*sidePadding)
            // polaroid.y = -1 * topPadding

uiImage['container'].w =600
uiImage['container'].h =600
// uiImage['container'].clip = true

            // uiImage['container'].w = w//readyImage.resource.w + (padding * 2)
            // uiImage['container'].h = polaroid.h = h//readyImage.resource.h + (padding * constants.polaroid.bottomMultiplier)
            polaroid.a = 1          // make the polaroid effect visible
        })    
    }
})
