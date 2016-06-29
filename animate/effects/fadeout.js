// fadeout.js
// makes an image fade into the background

module.exports = function(pic,scene,callback) {
    pic.animateTo({a: 0}, 1.25, scene.animation.TWEEN_LINEAR, scene.animation.OPTION_LOOP, 1)
        .then(function(f){
            callback(pic)
        }); 
}
