// pxImage 

var pxImage = function(c) { 

    c.t = "image"

    return {
        config      : c,
        addEffects  : function(pxImageEffects) {
            this['effects'] = pxImageEffects
            this['config'].t = 'object'         // for effects, image goes into a container
            return this
        }
    }
}

module.exports = pxImage