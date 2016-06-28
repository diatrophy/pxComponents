// pxAnimate.js

px.import({
  pxImageRenderer:'../image/pxImageRenderer.js',
  randomFlyIn:'effects/randomFlyIn.js',
  fadeout:'effects/fadeout.js',
  pxMath:'../pxMath.js'
}).then(function importsAreReady(imports) {

    var pxImageRenderer = imports.pxImageRenderer,
        pxMath = imports.pxMath(),
        effectFunctions = { 
            randomFlyIn     : imports.randomFlyIn,
            fadeout       : imports.fadeout
        }

    module.exports = function(scene) { 

        return {

            // animates a single image
            animate     : function(pxImage,pxAnimateEffects,callback) {
                if (pxAnimateEffects.effects['randomFlyIn']) {
                    effectFunctions['randomFlyIn'](pxImage,scene,callback)
                }
            },

            // animates a list of images
            animateList : function(pxImageList,pxAnimateEffects,loop,maxImagesOnScreen,callback) {

                // save function for use in recursion
                var animate = this.animate

                // a stack to keep track of all the image rendered to the screen
                var animateStack = []

                // recursive function that applies animation to a list of function
                // the animation is sequential
                var animateImageFromList = function(index) {

                    // render all the animation in the list and afterward invoke the callback
                    if (index < pxImageList.length) {

                        // TODO - nice to have pre-loading of a certain set of images prior
                        animate(pxImageList[index],pxAnimateEffects,function(pxImage){

                            // record the image into the stack
                            animateStack.push(pxImage.container)

                            // reset the index, if the settings call for looping
                            if (loop) {
                                if (index+1 == pxImageList.length) {
                                    index = -1                      // set the index
                                } 

                                // TODO : the following operations should probably be
                                // part of some cleanup function

                                // get rid of the oldest image on the screen by fade out
                                if (animateStack.length > maxImagesOnScreen) {
                                    var container = animateStack.shift()
                                    effectFunctions['fadeout'](container,scene,function(c){
                                        c.remove()
                                    })
                                }
                            }

                            animateImageFromList(index + 1)         // recurse
                        })
                    } else {
                        // final callback - when all animations have been applied
                        callback()
                    }
                }

                // start the recursion
                animateImageFromList(0)
            }
        }
    }
})