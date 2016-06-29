// randomFlyIn.js
// applies a random fly in animation on the PxImage

px.import({
    imageRenderer:'../../image/imageRenderer.js',
    math:'../../math.js'
}).then(function importsAreReady(imports) {

    var imageRenderer = imports.imageRenderer,
        math = imports.math()

    module.exports = function(uiImage,scene,callback) {

        // setup the image starting location - outside the view area, as we want the image to 'fly-in' from
        // outside the view port
        uiImage.config.x = (math.randomInt(0,1)==0)?-1000:scene.w+2000
        uiImage.config.y = math.randomInt(-200, 800)
        uiImage.config.sx = 1
        uiImage.config.sy = 1

        // first render the image to the random location out of the viewport and then move it into the scene
        imageRenderer(scene).render(uiImage,function(uiImage){

            var picture = uiImage["container"]
            var image = uiImage["image"]

            // apply the animation and invoke the callback when the promise is returned
            picture.animateTo({
                            x   :   math.randomInt(50,scene.w-(image.resource.w*uiImage.originalSx)-50),
                            y   :   math.randomInt(50,scene.h-(image.resource.h*uiImage.originalSy)-50), 
                            r   :   math.randomInt(-15,15),
                            sx  :   uiImage.originalSx, 
                            sy  :   uiImage.originalSy 
                        },2,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
                    .then(function(){
                        callback(uiImage)
                    })
        })
    }
})
