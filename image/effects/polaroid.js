// polaroid.js
// pre-effect

px.import({
  constants:'constants.js'
}).then(function importsAreReady(imports) {

    var constants = imports.constants

    module.exports =  function(scene,pxImage,callbackList) {

        var polaroid = scene.create({       // create a rectangle to simulate a polaroid
            t:"rect",
            parent:pxImage['container'],
            fillColor:0xF8F8F8FF,
            lineColor:0xCCCCCC80,
            lineWidth:4})   

        pxImage["polaroid"] = polaroid

        // register a callback to re-size the polaroid frame after the image has been rendered
        callbackList.push(function(pxImage,scale){

            var readyImage = pxImage.image

            // TODO - padding could be scaled to match the scale of the rendered image
            var padding = constants.polaroid.padding 

            // polaroid is scaled to match the scale of the rendered image
            polaroid.x = polaroid.y = -1 * padding
            polaroid.w = readyImage.resource.w + (padding * 2)
            polaroid.h = readyImage.resource.h + (padding * 6)
        })    
    }
})
