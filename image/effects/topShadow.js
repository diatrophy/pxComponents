// topShadow.js
// post effect

module.exports =  function(scene,uiImage,callbackList) {
    
    // create the top shadow on top of it
    var effects = uiImage.effects.effects,
        image   = uiImage['image'],
        topShadow = scene.create({
                        t:'image', 
                        // TODO - currently this effect happens via an image overlay. 
                        // should explore whether a rectangle with
                        // gausian blur would acheive the same effect
                        url:effects['topShadow'].url,    
                        parent:uiImage['container'],
                        stretchX:1,stretchY:1,      // the shadow image stretches over the actual image
                        a:0,                        // top shadow has some transparency
                    })       

    // register a callback to re-size the top shadow after the image has been rendered
    callbackList.push(function(uiImage,scale){

        var container = uiImage.container

        var readyImage = uiImage.image

        var effects = uiImage.effects.effects

        if (effects['polaroid']) {

                var polaroidWidth = effects['polaroid'].w

                var sidePadding = polaroidWidth/17
                var topPadding = sidePadding * (3/2)
                var bottomPadding = sidePadding * 4

                topShadow.x += sidePadding 
                topShadow.y += topPadding

                // topShadow is scaled to match the scale of the polaroid frame
                topShadow.w = polaroidWidth - (sidePadding*2)
                topShadow.h = polaroidWidth * 1.24415204678363 - (topPadding) - bottomPadding

                topShadow.a = 0.45             // make the topShadow visible
                topShadow.moveToFront()
                
        } else {

            if(scale>0) {
                // if the image is streched we need to scale the top shadow using the image's width/height
                // otherwise we need to scale using the image's resource width/height
                // this feels a little kludgy, and probably could be improved
                if (readyImage.stretchY == 0 && readyImage.stretchY == 0) {
                    topShadow.w =  readyImage.resource.w 
                    topShadow.h =  readyImage.resource.h  
                } else {
                    topShadow.w =  readyImage.w 
                    topShadow.h =  readyImage.h 
                }
                topShadow.a = 0.75  // only apply the transparency after everything has loaded
            }
        }
    })

}
