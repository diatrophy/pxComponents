// randomFlyInList.js

px.import({
    randomFlyIn : 'randomFlyIn.js',    
    fadeout     : 'fadeout.js'
}).then(function importsAreReady(imports) {

    var imageRenderer = imports.imageRenderer,
        randomFlyIn = imports.randomFlyIn,
        fadeout = imports.fadeout

    module.exports = function(uiImageList,config,scene,callback) {

        // a stack to keep track of all the image rendered to the screen
        var animateStack = []

        // recursive function that applies animation to a list of function
        // the animation is sequential
        var animateImageFromList = function(index) {

            // render all the animation in the list and afterward invoke the callback
            if (index < uiImageList.length) {

                // TODO - nice to have pre-loading of a certain set of images prior
                randomFlyIn(uiImageList[index],scene,function(uiImage){

                    // record the image into the stack
                    animateStack.push(uiImage.container)

                    // reset the index, if the settings call for looping
                    if (config.loop) {

                        if (index+1 == uiImageList.length) {
                            index = -1                      // set the index
                        } 

                        // TODO : the following operations should probably be
                        // part of some cleanup function

                        // get rid of the oldest image on the screen by fade out
                        if (animateStack.length > config.maxImagesOnScreen - 1) {
                            var container = animateStack.shift()
                            fadeout(container,scene,function(c){
                                c.remove();
                                console.log(">>>>> setting c to null");
                                c = null;
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
})
