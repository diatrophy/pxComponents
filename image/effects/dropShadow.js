// dropShadow.js
// pre-effect

px.import({
  constants:'constants.js'
}).then(function importsAreReady(imports) {

    var constants = imports.constants

    module.exports =  function(scene,uiImage,callbackList) {

        var imageUrl = uiImage.config.url

        var effects = uiImage.effects.effects

        // add the shadow
        var shadow = scene.create({
                            t:"image9",
                            url:effects['dropShadow'].url,
                            parent:uiImage['container'],
                            a:0,
                            // x:constants.dropShadow.offset,y:constants.dropShadow.offset,
                            // TODO - the following properties are image9 related and probably should
                            // not be hard-coded as this is associated with the Image ie.
                            // a different shadow image may have different inset(s)
                            insetTop:48,insetBottom:48,insetLeft:48,insetRight:48
                        })

        uiImage["shadow"] = shadow

        // in this case we can only determine the Width/Height of the shadow
        // after it has been loaded, hence we add the callback to the list of 
        // post image load funtions to run
        callbackList.push(function(uiImage,scale){

            var readyImage = uiImage.image

            // TODO - this needs more work - At the moment the shadow is left oriented, and
            // would be nice if it were configurable
            var shadowOffset = effects['dropShadow'].size != null ? effects['dropShadow'].size : constants.dropShadow.offset
            var blurSize = constants.dropShadow.blurSize

            var addShadowOffset = ( shadowOffset * 2) - blurSize
            var imageW = readyImage.resource.w
            var imageH = readyImage.resource.h

            if (effects['polaroid']) {

                var sidePadding = effects['polaroid'].sidePadding
                var topPadding = effects['polaroid'].topPadding
                var bottomPadding = effects['polaroid'].bottomPadding

                shadow.y = -1 * 30
                shadow.x = -1 * 30

                // shadow is scaled to match the scale of the polaroid frame
                shadow.w = effects['polaroid'].w + 2 * 30 + shadowOffset 
                shadow.h = effects['polaroid'].h + 2 * 30 + shadowOffset 

                shadow.a = 0.45             // make the shadow visible

            } else {
                
                readyImage.w = uiImage.container.sx * readyImage.resource.w
                readyImage.h = uiImage.container.sy * readyImage.resource.h

                uiImage.container.sx = uiImage.container.sy = 1

                shadow.y = -1 * 30
                shadow.x = -1 * 30

                // shadow is scaled to match the scale of the rendered image
                shadow.w =  readyImage.w + 2 * 30 + shadowOffset
                shadow.h =  readyImage.h + 2 * 30 + shadowOffset 

                shadow.a = 0.45             // make the shadow visible
            }
            
        })
    }

})