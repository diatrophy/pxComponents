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
                    console.log('Animating - ')
                    effectFunctions['randomFlyIn'](pxImage,scene,callback)
                }
            },

            animateList : function(pxImageList,pxAnimateEffects,callback) {

                var animate = this.animate

                // recursively apply the animation effects to the images
                var _animate = function(index) {

                    if (index < pxImageList.length) {
                        animate(pxImageList[index],pxAnimateEffects,function(){
                            _animate(index + 1)
                        })
                    } else {
                        callback()
                    }
                }

                _animate(0)
            }
        }
    }

    module.exports = pxAnimate
})