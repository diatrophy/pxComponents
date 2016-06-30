// fadein.js

// makes an image appear as a fade in

module.exports = function(pic,scene,callback) {
    pic.animateTo({a: 1}, 1.25, scene.animation.TWEEN_LINEAR, scene.animation.OPTION_LOOP, 1)
        .then(function(f){
            callback(pic)
        }); 
}
