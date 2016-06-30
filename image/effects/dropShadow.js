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
            var shadowOffset = constants.dropShadow.offset
            var blurSize = constants.dropShadow.blurSize
            var polaroidPadding = constants.polaroid.padding

            var addShadowOffset = ( shadowOffset * 2) - blurSize
            var imageW = readyImage.resource.w
            var imageH = readyImage.resource.h

            if (uiImage.polaroid) {

                // shadow is scaled to match the scale of the polaroid frame
                shadow.x = shadow.y = -1 * polaroidPadding 
                shadow.w = imageW + (2*polaroidPadding) + addShadowOffset
                shadow.h = imageH + (4*polaroidPadding) + addShadowOffset

            } else {
                // shadow is scaled to match the scale of the rendered image
                shadow.w =  imageW + addShadowOffset
                shadow.h =  imageH + addShadowOffset
            }

            shadow.a = 0.45             // make the shadow visible
        })
    }

})