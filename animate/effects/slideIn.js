// slideIn.js

px.import({
    imageRenderer:'../../image/imageRenderer.js',
    math:'../../math.js'
}).then(function importsAreReady(imports) {

    var imageRenderer = imports.imageRenderer,
        math = imports.math()

    module.exports = function(imageList,scene,callback) {

        // first load all images and when loaded, start animation

        // setup the image starting location - outside the view area, as we want the image to 'fly-in' from
        // outside the view port
        pxImage.config.x = (pxMath.randomInt(0,1)==0)?-1000:scene.w+2000
        pxImage.config.y = pxMath.randomInt(-200, 800)
        pxImage.config.sx = 1
        pxImage.config.sy = 1

        // first render the image to the random location out of the viewport and then move it into the scene
        pxImageRenderer(scene).render(pxImage,function(pxImage){

            var picture = pxImage["container"]
            var image = pxImage["image"]

            // apply the animation and invoke the callback when the promise is returned
            picture.animateTo({
                            x   :   pxMath.randomInt(50,scene.w-(image.resource.w*pxImage.originalSx)-50),
                            y   :   pxMath.randomInt(50,scene.h-(image.resource.h*pxImage.originalSy)-50), 
                            r   :   pxMath.randomInt(-15,15),
                            sx  :   pxImage.originalSx, 
                            sy  :   pxImage.originalSy 
                        },2,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
                    .then(function(){
                        callback(pxImage)
                    })
        })
    }
})
