// border.js
// pre-effect

px.import({
  constants:'constants.js'
}).then(function importsAreReady(imports) {

    var constants = imports.constants

    module.exports =  function(scene,uiImage,callbackList) {

        var effects = uiImage.effects.effects

        var border = scene.create({       // create a rectangle to simulate a border
            t:"rect",
            parent:uiImage['container'],
            fillColor:effects['border'].borderColor,
            a:0})   

        uiImage["border"] = border


        // register a callback to re-size the border frame after the image has been rendered
        callbackList.push(function(uiImage,scale){

            var readyImage = uiImage.image

            // TODO - padding could be scaled to match the scale of the rendered image
            // var padding = constants.border.padding 

            // polaroid is scaled to match the scale of the rendered image
            border.x = -1 * effects['border'].lPadding
            border.y = -1 * effects['border'].tPadding
            border.w = uiImage.config.w + effects['border'].lPadding + effects['border'].rPadding
            border.h = uiImage.config.h + effects['border'].tPadding + effects['border'].bPadding
            border.a = 1          // make the border effect visible
        })    
    }
})
