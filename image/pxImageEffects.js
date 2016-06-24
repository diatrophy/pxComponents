// pxImageEffects.js

var pxImageEffects = function() { 
    
    return {
        effects      : {},
        // adds a shadow over the image
        topShadow   : function(url) {
           this.effects['topShadow'] = {url:url}
           return this
        },
        // adds a drop shadow under the image
        dropShadow   : function(url) {
           this.effects['dropShadow'] = {url:url}
           return this
        },
        // adds a polaroid effect to the image
        polaroid   : function(url) {
           this.effects['polaroid'] = {}
           return this
        }
    }
}

module.exports = pxImageEffects