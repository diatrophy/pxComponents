// slideInList.js

px.import({
    imageRenderer:'../../image/imageRenderer.js',
    randomFlyIn : 'randomFlyIn.js',    
    fadein      : 'fadein.js'
}).then(function importsAreReady(imports) {

    var imageRenderer   = imports.imageRenderer,
        randomFlyIn     = imports.randomFlyIn,
        fadein          = imports.fadein

    module.exports = function(uiImageList,config,scene,callback) {

        // for a list slide in, images are stiched together in a single imageContainer and then the whole container 
        // is animated to slide from left to right
        // TODO - we could probably optimize memory by loading images on demand

        // this could have been a uiImage, but now I am invoking scene directly
        var imageContainer = scene.create({t:"object",parent:scene.root, a:0, x:0, y:0});

        var imagePromises = []

        var xLoc = 0            // keeps track of the next stich point of an image
        var paddingW = 0

        // recursive function
        var createImage = function(index,padding) {

            var i = index
            if (padding) {
                i = index % uiImageList.length
            }

            uiImageList[i].config.parent = imageContainer
            uiImageList[i].config.a = 0

            imageRenderer(scene).render(uiImageList[i],function(uiImage){
                
                // after image has loaded - let's resize it -

                var img = uiImage.image

                // since we aren't using the scaling params - determine the image width over 
                // here by calculating the ratio
                var picW = img.resource.w
                var picH = img.resource.h
                if( picH !== scene.root.h) {
                    picW = scene.root.h * picW/picH
                }

                img.x = xLoc            // image gets stiched to the end of the previous image or 0 if first
                img.y = 0               // starts at top of screen
                img.sx = 1              // scaling is irrelevant as we are setting the w/h 
                img.sy = 1              // so we set both to 1
                img.h = scene.root.h    // we want the image to be full screen
                img.w = picW            // set width based on calculated value above
                img.stretchX = img.stretchY = scene.stretch.STRETCH
                xLoc = xLoc + img.w     // increment the next stich point
                img.a = 1               // make the image visible

                if (padding) {
                    paddingW += img.w   // we want to keep a track of how wide the padding is
                }

                if (i+1 < uiImageList.length && padding != true) {      // first render all the images in the list
                    createImage(index+1)
                } else {                                                // when done add the padded images

                    if (paddingW < scene.root.w) {
                        createImage(index+1,true)                       // we only add a screen-full worth of images
                    } else {

                        // and then start the slide in animation
                        var w = xLoc,
                            numImages = uiImageList.length

                        // make the container fade in
                        fadein(imageContainer,scene,function(container){
                            // container faded in - now lets start scrolling the container 

                            var loop = 1
                            if (config.loop)
                                loop = scene.animation.COUNT_FOREVER

                            // animate the whole container to the left upto the entire width of the images minus any padding
                            // the padding subtraction ensures that the container is at a point where the animation loop appears
                            // as a seamless transition
                             imageContainer.animateTo({x: -(xLoc - paddingW) },
                                (scene.root.w/60)*numImages,
                                scene.animation.TWEEN_LINEAR,scene.animation.OPTION_LOOP,
                                loop);

                             callback()
                        })
                    }    
                } 
            })
        }
        createImage(0,false)          // start the recursion
    }
}).catch( function(err){
    console.error("Error: " + err)
});

