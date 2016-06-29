// pxImageRenderer.js

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

    module.exports = function(scene) { 

        return {
            render  : function(uiImage,callback) {

                if (uiImage.effects)

                    this._renderWithEffects(uiImage, callback)
                else {

                    var image = scene.create(uiImage.config)
                
                    image.ready.then(function(image){
                        console.log('image is loaded')
                        uiImage['image'] = image 
                        callback(uiImage)
                    })  
                }         
            },
            _renderWithEffects : function(uiImage,callback) {
                
                console.log('Rendering with effects')
                console.log(uiImage.effects)

                var effects = uiImage.effects.effects

                var callbackList = []
                var applyEffectFunction = function(effect,index,array){
                    if (effects[effect]) {
                        effectFunctions[effect](scene,uiImage,callbackList)
                    }
                }

                // first create the container
                var container = scene.create(uiImage.config)
                uiImage['container'] = container

                preEffects.forEach(applyEffectFunction)

                // then create the image, with the container above as parent
                var imageConfig = {t:'image',url:uiImage.config.url,parent:container}
                if (uiImage.config.w && uiImage.config.h) {
                    imageConfig.w = uiImage.config.w
                    imageConfig.h = uiImage.config.h
                }
                if (uiImage.config.stretchX && uiImage.config.stretchY) {
                    imageConfig.stretchX = uiImage.config.stretchX
                    imageConfig.stretchY = uiImage.config.stretchY
                }

                var image = scene.create(imageConfig)

                uiImage['image'] = image

                postEffects.forEach(applyEffectFunction)

                // when the image is loaded call all the callbacks that may have been added by the 
                // individual effect function before invoking the final callback defined by the Callee
                image.ready.then(function(image){
                
                    uiImage['image'] = image 

                    // we determine the containers scale here, to avoid recalculating it when
                    // applying callbacks for all the effects
                    var scale = (container.sx<container.sy)?container.sx:container.sy;

                    callbackList.forEach(function(element,index,array){
                        element(uiImage,scale)
                    })
                    callback(uiImage)
                })
            }
        }
    }
})