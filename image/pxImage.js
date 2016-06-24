// pxImage 

var pxImage = function(c) { 

    c.t = "image"

    return {
        config      : c,
        addEffects  : function(pxImageEffects) {
            // console.log('Adding effects')
            // console.log(pxImageEffects)
            this['effects'] = pxImageEffects
            this['config'].t = 'object'         // for effects, image goes into a container
            // console.log('in here')
            return this
        }
    }
}

module.exports = pxImage