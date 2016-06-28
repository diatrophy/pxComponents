// fadeout.js
// makes an image fade into the background

px.import({
    pxImageRenderer:'../../image/pxImageRenderer.js',
    pxMath:'../../pxMath.js'
}).then(function importsAreReady(imports) {

    var pxImageRenderer = imports.pxImageRenderer,
        pxMath = imports.pxMath()

    module.exports = function(pic,scene,callback) {
        pic.animateTo({a: 0}, 1.25, scene.animation.TWEEN_LINEAR, scene.animation.OPTION_LOOP, 1)
            .then(function(f){
                callback(pic)
            }); 
    }
})

