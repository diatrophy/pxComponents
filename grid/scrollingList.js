// scrollingList.js
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    imageEffects    : '../image/imageEffects.js',
    math            : '../math.js'
}).then(function importsAreReady(imports) {

    var math = imports.math(),
        image = imports.image,
        imageEffects = imports.imageEffects
     
    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            
            init : function(container,channelList,width,tileHeight) {

                this.channelList = channelList
                // Detail widgets
                var dtl = scene.create({
                            // a : 0,
                            t : "rect",
                            parent : container,  
                            w : width, 
                            h : container.h, 
                            clip:true});
                this.dtl = dtl;
                this.tileHeight = tileHeight

                return this;
            },
            tileRenderFunction : function(func) {
                // we register rendering action here for each individual tile 
                this.tileRenderFunction = func
                return this
            },
            render  : function(callback) {

                var borderWidth = 1
    
                var dtl = this.dtl

                var tileH = this.tileHeight,
                    xOffset = 0.29 * dtl.w,
                    yOffset = borderWidth

                var channelW = dtl.w-xOffset-1

                var f   = this.tileRenderFunction,
                    channelList = this.channelList

                for (var i=0;i<channelList.length;i++) {

                    var channelH = tileH

                    imageRenderer.render(image({t:'rect',parent:dtl,fillColor:0x98C866,a:1,x:xOffset,y:yOffset,
                        w:channelW,h:channelH,data:channelList[i]})
                        .addEffects(imageEffects().border(borderWidth,borderWidth,0,1,0x555555FF))
                        ,function(channelTile){
                            f(channelTile)    
                    })

                    yOffset += channelH + borderWidth
                }

                callback()
            }
        }
    }

}).catch( function(err){
    console.error("Error on Grid selector: ")
    console.log(err)
});
