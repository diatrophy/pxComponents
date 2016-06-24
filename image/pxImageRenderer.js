// TODO - see if it is possible to move these rendering functions
// into their own file/module

px.import({
  topShadow:'effects/topShadow.js',
  dropShadow:'effects/dropShadow.js',
  polaroid:'effects/polaroid.js'
}).then(function importsAreReady(imports) {

    var effectFunctions = { 
        topShadow   : imports.topShadow,
        dropShadow  : imports.dropShadow,
        polaroid    : imports.polaroid
    }
   
    var preEffects = ['dropShadow','polaroid']
    var postEffects = ['topShadow']

    var pxImageRenderer = function(scene) { 

        return {
            render  : function(pxImage,callback) {

                if (pxImage.effects)

                    this._renderWithEffects(pxImage, callback)
                else {

                    var image = scene.create(pxImage.config)
                
                    image.ready.then(function(image){
                        console.log('image is loaded')
                        pxImage['image'] = image 
                        callback(pxImage)
                    })  
                }         
            },
            _renderWithEffects : function(pxImage,callback) {
                
                console.log('Rendering with effects')
                console.log(pxImage.effects)

                var effects = pxImage.effects.effects

                var callbackList = []
                var applyEffectFunction = function(effect,index,array){
                    if (effects[effect]) {
                        effectFunctions[effect](scene,pxImage,callbackList)
                    }
                }

                // first create the container
                var container = scene.create(pxImage.config)
                pxImage['container'] = container

                preEffects.forEach(applyEffectFunction)

                // then create the image, with the container above as parent
                var imageConfig = {t:'image',url:pxImage.config.url,parent:container}
                if (pxImage.config.w && pxImage.config.h) {
                    imageConfig.w = pxImage.config.w
                    imageConfig.h = pxImage.config.h
                }
                if (pxImage.config.stretchX && pxImage.config.stretchY) {
                    imageConfig.stretchX = pxImage.config.stretchX
                    imageConfig.stretchY = pxImage.config.stretchY
                }

                var image = scene.create(imageConfig)

                pxImage['image'] = image

                postEffects.forEach(applyEffectFunction)

                // when the image is loaded call all the callbacks that may have been added by the 
                // individual effect function before invoking the final callback defined by the Callee
                image.ready.then(function(image){
                
                    pxImage['image'] = image 

                    // we determine the containers scale here, to avoid recalculating it when
                    // applying callbacks for all the effects
                    var scale = (container.sx<container.sy)?container.sx:container.sy;

            // var imageW = image.resource.w * s
            // var imageH = image.resource.h * s
            // container.h = imageH
            // container.w = imageW

                    callbackList.forEach(function(element,index,array){
                        element(pxImage,scale)
                    })
                    callback(pxImage)
                })
            }
        }
    }

    module.exports = pxImageRenderer

})