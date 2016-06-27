// pxAnimate.js

px.import({
  pxImageRenderer:'../image/pxImageRenderer.js',
  randomFlyIn:'effects/randomFlyIn.js',
  pxMath:'../pxMath.js'
}).then(function importsAreReady(imports) {

    var pxImageRenderer = imports.pxImageRenderer,
        pxMath = imports.pxMath(),
        effectFunctions = { 
            randomFlyIn   : imports.randomFlyIn,
        }

    var pxAnimate = function(scene) { 

        return {

            animate     : function(pxImage,pxAnimateEffects,callback) {

                if (pxAnimateEffects.effects['randomFlyIn']) {
                    effectFunctions['randomFlyIn'](pxImage,scene,callback)
                }
            }
        }
    }

    module.exports = pxAnimate
})