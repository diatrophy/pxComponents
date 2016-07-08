// border.js
// pre-effect

px.import({
  constants:'constants.js'
}).then(function importsAreReady(imports) {

    var constants = imports.constants

    module.exports =  function(scene,uiImage,callbackList) {

        var border = scene.create({       // create a rectangle to simulate a border
            t:"rect",
            parent:uiImage['container'],
            fillColor:0xF8F8F8FF,
            lineColor:0xCCCCCC80,
            a:0,
            lineWidth:0})   

        uiImage["border"] = border

        var effects = uiImage.effects.effects
        var padding = effects['border'].padding
        console.log(padding)

        // register a callback to re-size the border frame after the image has been rendered
        callbackList.push(function(uiImage,scale){

            var readyImage = uiImage.image

            // TODO - padding could be scaled to match the scale of the rendered image
            // var padding = constants.border.padding 

            // polaroid is scaled to match the scale of the rendered image
            border.x = border.y = -1 * padding
            border.w = uiImage.config.w + (padding * 2)
            border.h = uiImage.config.h + (padding * 2)
            border.a = 1          // make the border effect visible
        })    
    }
})
