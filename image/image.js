// uiImage 
// This is a wrapper object that contains info to build a pxscene 'image' object

var image = function(c) { 

    // default the config object type to 'image'
    if (c != null) {
        if (c.url != null) {
            c.t = "image"    
        } else {
            c.t = "rect"    // if no url is supplied this image can be rendered as a rect
        }
    }

    var ret = {
        config      : c,
 
        // adds effects to this data object
        addEffects  : function(imageEffects) {
            this['effects'] = imageEffects
            this['config'].t = 'object'         // for effects, image goes into a container
            return this
        },

        // 'static' function that converts a list of images from a data provider into pxImages
        // the following is a sample image from a data provider
        /*
            {
                width: 1024,
                height: 459,
                url: "http://farm8.staticflickr.com/7180/27318068244_49d5f3629c_b.jpg",
                caption: "Lake Tipsoo, Washington.",
                thumbnailInfo: {
                    width: 240,
                    height: 108,
                    url: "http://farm8.staticflickr.com/7180/27318068244_49d5f3629c_m.jpg"
                },
                createdTime: "2016-06-27T04:57:16.000+0000",
                username: "Pedalhead'71"
            }
        */
        fromDataProvider : function(images,root,effects,overrides) {
            var imageList = []
            if (images != null && images.length > 0) {
                for (var i=0;i<images.length;i++) {
                    var img = image({url:images[i].url,caption:images[i].caption,parent:root,x:50,y:50,sx:0.40,sy:0.40})
                    if (effects != null) {
                        img.addEffects(effects)             // apply effects to the image
                    }
                    if (overrides != null) {
                        for(k in overrides) {
                            img.config[k] = overrides[k]    // apply any overrides for all images
                        }
                    }
                    imageList.push(img)
                }
            }
            return imageList
        }
    }

    if (c != null) {
        // save the original scale as animating image may alter this
        ret.originalSx  = c.sx
        ret.originalSy  = c.sy
        ret.originalT = c.t
    }
    return ret
}

module.exports = image
