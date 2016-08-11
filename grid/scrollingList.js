    // scrollingList.js
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    imageEffects    : '../image/imageEffects.js',
    math            : '../math.js'
}).then(function importsAreReady(imports) {

    var image = imports.image,
        imageEffects = imports.imageEffects
    var transparentColor = 0xffffff00

    var animationSpeed = 0.50

    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)
        var borderWidth = 1
        var cellsPerSector = 5

        return {
            
            init : function(container,allChannelList,currentChannelCellNumber,width,tileHeight) {

                this.topCell = currentChannelCellNumber
                this.bottomCell = currentChannelCellNumber + cellsPerSector
                this.allChannelList = allChannelList

                this.currentYLoc = 0

                // initialize a scrolling container to hold the scroll list
                var dtl = scene.create({
                            t : "object",
                            fillColor : transparentColor,
                            y : this.currentYLoc,    // position the scrolling list at the current cell
                            parent : container,
                            w : width,
                            h : tileHeight * cellsPerSector,
                            clip:false})
                this.scrollingContainer = dtl;
                this.xOffset = Math.round(0.29 * this.scrollingContainer.w)
                this.tileHeight = tileHeight
                this.channelW = width-this.xOffset    // width of the tile determined after taking into account the offset and border

                return this;
            },
            tileRenderFunction : function(func) {
                // we register rendering action here for each individual tile 
                this.tileRenderFunction = func
                return this
            },
            _generateCells : function(channelList,container,yOffset) {

                var cells = []

                for (var i=0;i<channelList.length;i++) {

                    cells.push(image({t:'rect',parent:container,
                        fillColor:transparentColor,
                        a:1,x:this.xOffset,y:yOffset,
                        w:this.channelW,
                        h:this.tileHeight,
                        data:channelList[i]})
                        .addEffects(
                            imageEffects()
                                .border2(borderWidth,borderWidth,0,1,0x555555FF)
                        ))
                    yOffset += this.tileHeight
                }
                return cells
            },
            render  : function(callback) {

                // loops through all the channels around the current channel and builds a subset of channel data
                var channelList = []
                for (var i=this.topCell-cellsPerSector; i < this.bottomCell+cellsPerSector; i++) {
                    channelList.push(this.allChannelList[i])
                }

                this.currentSector = this._addSector(channelList.slice(cellsPerSector,2*cellsPerSector),0)
                this.addTopSector(this.currentSector)
                this.addBottomSector(this.currentSector)

                callback(channelList)
            },
            // updates the position of the scrolling list. scrollYOffset is the offset that the list should scroll to
            update : function(scrollYOffset) {
                this.currentYLoc += scrollYOffset       // add the offset to the currentLocation
                this.scrollingContainer.animateTo({
                                y: this.currentYLoc, 
                            },animationSpeed,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
            },
            _addSector : function(channelList,sectorY){

                var sector = scene.create({
                    a:1,
                    t : "rect",
                    fillColor:transparentColor,
                    y : sectorY,    // position the scrolling list at the current cell
                    parent :  this.scrollingContainer,
                    w : this.scrollingContainer.w ,
                    h : this.scrollingContainer.h,
                    clip:false});

                var f   = this.tileRenderFunction

                var cells = this._generateCells(channelList,sector,borderWidth)

                // Render the cells
                imageRenderer.renderList(cells,function(channelTile){
                    f(channelTile)                          // invoke the rendering function
                },function(){
                    // do nothing
                })
                return {container:sector}
            },
            addTopSector : function(relativeSector) {
                var channelList = []

                var start = this.topCell - cellsPerSector
                if (start < 0) {
                    for (var i = start; i < 0; i++) {
                        channelList.push(this.allChannelList[this.allChannelList.length+i])
                    }
                    for (var i = 0; i < cellsPerSector + start; i++) {
                        channelList.push(this.allChannelList[i])
                    }
                    this.topCell = this.allChannelList.length+start

                } else {
                    for (var i = start; i < this.topCell; i++) {
                        channelList.push(this.allChannelList[i])
                    }
                    this.topCell -= cellsPerSector

                }
                var sectorYOffset = relativeSector.container.y - relativeSector.container.h - borderWidth
                var sector = this._addSector(channelList,sectorYOffset)
                relativeSector.top = sector
                sector.bottom = relativeSector
            },
            addBottomSector : function(relativeSector) {
                var channelList = []
                var end = this.bottomCell + cellsPerSector
                if (end > this.allChannelList.length) {
                    for (var i = this.bottomCell; i < this.allChannelList.length; i++) {
                        channelList.push(this.allChannelList[i])
                    }
                    for (var i = 0; i < end - this.allChannelList.length; i++) {
                        channelList.push(this.allChannelList[i])
                    }
                    this.bottomCell = end - this.allChannelList.length
                } else {
                    for (var i = this.bottomCell; i < end; i++) {
                        channelList.push(this.allChannelList[i])
                    }
                    this.bottomCell += cellsPerSector
                }
                var sector = this._addSector(channelList,relativeSector.container.y + relativeSector.container.h + borderWidth)
                relativeSector.bottom = sector
                sector.top = relativeSector
            }
        }
    }

}).catch( function(err){
    console.error("Error on Grid selector: ")
    console.log(err)
});
