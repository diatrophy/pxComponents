// topShadow.js
// post effect

module.exports =  function(scene,pxImage,callbackList) {
    
    // create the top shadow on top of it
    var effects = pxImage.effects.effects,
        image   = pxImage['image'],
        topShadow = scene.create({
                        t:'image', 
                        // TODO - currently this effect happens via an image overlay. 
                        // should explore whether a rectangle with
                        // gausian blur would acheive the same effect
                        url:effects['topShadow'].url,    
                        parent:pxImage['container'],
                        stretchX:1,stretchY:1,      // the shadow image stretches over the actual image
                        a:0.75,                     // top shadow has some transparency
                    })       

    // register a callback to re-size the top shadow after the image has been rendered
    callbackList.push(function(pxImage,scale){

        var container = pxImage.container

        var readyImage = pxImage.image

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
        }
    })

}
