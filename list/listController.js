// listController.js
//
// orchestrates the list movements and selector placement
//
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    imageEffects: '../image/imageEffects.js',
    math: '../math.js',
    logger: '../logger.js'
}).then(function importsAreReady(imports) {

    var animationSpeed = 0.50,
        logger = imports.logger()

    module.exports = function (scene) {

        return {
            register : function(scrollingList) {
                
                scrollingList.container.parent.on("onKeyDown", function (e) {

                    console.log('in here ---- key pressed ' + e)

                })

            }
        }
    }

}).catch(function (err) {
    console.error("Error on List Controller : ")
    console.log(err.stack)
});
