// animate.js

px.import({
    randomFlyIn         : 'effects/randomFlyIn.js',
    randomFlyInList     : 'effects/randomFlyInList.js',
    slideInList         : 'effects/slideInList.js'
}).then(function importsAreReady(imports) {

    var effectFunctions = { 
            randomFlyIn     : imports.randomFlyIn,
            randomFlyInList : imports.randomFlyInList,
            slideInList     : imports.slideInList
        }

    module.exports = function(scene) { 

        return {

            // animates a single image
            animate     : function(uiImage,animateEffects,callback) {
                if (animateEffects.effects['randomFlyIn']) {
                    effectFunctions['randomFlyIn'](uiImage,scene,callback)
                }
            },

            // animates a list of images
            animateList : function(uiImageList,animateEffects,callback) {

                if (animateEffects.effects['slideIn']) {

                    effectFunctions['slideInList'](uiImageList,animateEffects.effects['slideIn'],scene,callback)

                } else if (animateEffects.effects['randomFlyIn'] != null) {

                    effectFunctions['randomFlyInList'](uiImageList,animateEffects.effects['randomFlyIn'],scene,callback)

                }
            }
        }
    }
}).catch( function(err){
    console.error("Error: " + err)
});
