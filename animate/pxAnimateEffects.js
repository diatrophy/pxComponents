// pxAnimateEffects.js

var pxAnimateEffects = function() { 
    
    return {
        effects      : {},
        // adds a randomFlyIn effect on an image
        randomFlyIn   : function() {
           this.effects['randomFlyIn'] = {}
           return this
        }
    }
}

module.exports = pxAnimateEffects