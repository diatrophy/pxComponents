// randomFlyIn.js
// applies a random fly in animation on the PxImage

px.import({
    pxImageRenderer:'../../image/pxImageRenderer.js',
    pxMath:'../../pxMath.js'
}).then(function importsAreReady(imports) {

    var pxImageRenderer = imports.pxImageRenderer,
        pxMath = imports.pxMath()

    module.exports = function(pxImage,scene,callback) {

        // save the original x/y/sx/sy to variables for animate use later
        var originalX = pxImage.config.x, 
            originalY = pxImage.config.y, 
            originalSx = pxImage.config.sx,
            originalSy = pxImage.config.sy

        pxImage.config.x = (pxMath.randomInt(0,1)==0)?-1000:scene.w+2000
        pxImage.config.y = pxMath.randomInt(-200, 800)
        pxImage.config.sx = 1
        pxImage.config.sy = 1

        pxImageRenderer(scene).render(pxImage,function(pxImage){

            var picture = pxImage["container"]
            var image = pxImage["image"]

            picture.animateTo({
                        x   :   pxMath.randomInt(50,scene.w-(image.resource.w*originalSx)-50),
                        y   :   pxMath.randomInt(50,scene.h-(image.resource.h*originalSy)-50), 
                        r   :   pxMath.randomInt(-15,15),
                        sx  :   originalSx, 
                        sy  :   originalSy 
                    },
                    1,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)

            callback(pxImage)
        })
    }
})
