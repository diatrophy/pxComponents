// pxAnimateEffects.js

module.exports = function() { 
    
    return {
        effects      : {},
        // adds a randomFlyIn effect on an image
        randomFlyIn   : function(config) {
           this.effects['randomFlyIn'] = config == null ? {} : config
           return this
        },
        slideIn       : function(config) {
            this.effects['slideIn'] = config
            return this
        }
    }
}
