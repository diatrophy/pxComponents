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
     
    var animationSpeed = 0.50

    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)
        var borderWidth = 1

        return {
            
            init : function(container,channelList,width,tileHeight
                    ,currentCell) {             // this is the channel that the user is currently viewing

                this.channelList = channelList
                this.currentYLoc = -1 * (currentCell * (tileHeight + borderWidth))
                // initialize a scrolling container to hold the scroll list
                var dtl = scene.create({
                            // a : 0,
                            t : "rect",
                            y : this.currentYLoc,    // position the scrolling list at the current cell
                            parent : container,  
                            w : width, 
                            h : tileHeight * channelList.length, 
                            clip:false});
                this.scrollingContainer = dtl;
                this.tileHeight = tileHeight
                this.currentCell = currentCell
                return this;
            },
            tileRenderFunction : function(func) {
                // we register rendering action here for each individual tile 
                this.tileRenderFunction = func
                return this
            },
            render  : function(callback) {

    
                var dtl = this.scrollingContainer

                var tileH = this.tileHeight,
                    xOffset = 0.29 * dtl.w,     // the channel tile is offsetted within the list container (probably should be configurable)
                    yOffset = borderWidth

                var channelW = dtl.w-xOffset    // width of the tile determined after taking into account the offset and border

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
            },
            // updates the position of the scrolling list. scrollYOffset is the offset that the list should scroll to
            update : function(scrollYOffset) {
                this.currentYLoc += scrollYOffset       // add the offset to the currentLocation
                this.scrollingContainer.animateTo({
                                y: this.currentYLoc, 
                            },animationSpeed,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
            }
        }
    }

}).catch( function(err){
    console.error("Error on Grid selector: ")
    console.log(err)
});
