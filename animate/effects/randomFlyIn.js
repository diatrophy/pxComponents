// randomFlyIn.js
// applies a random fly in animation on the PxImage

px.import({
    pxImageRenderer:'../../image/pxImageRenderer.js',
    pxMath:'../../pxMath.js'
}).then(function importsAreReady(imports) {

    var pxImageRenderer = imports.pxImageRenderer,
        pxMath = imports.pxMath()

    module.exports = function(pxImage,scene,callback) {

        // save the original sx/sy as this will be the final scale of the image after animation completes
        var originalSx = pxImage.config.sx,
            originalSy = pxImage.config.sy

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
                            x   :   pxMath.randomInt(50,scene.w-(image.resource.w*originalSx)-50),
                            y   :   pxMath.randomInt(50,scene.h-(image.resource.h*originalSy)-50), 
                            r   :   pxMath.randomInt(-15,15),
                            sx  :   originalSx, 
                            sy  :   originalSy 
                        },2,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
                    .then(function(){
                        callback(pxImage)
                    })
        })
    }
})
