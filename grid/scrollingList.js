// scrollingList.js
//
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    imageEffects: '../image/imageEffects.js',
    math: '../math.js'
}).then(function importsAreReady(imports) {

    var image = imports.image,
        imageEffects = imports.imageEffects
    var transparentColor = 0xffffff00
    var greyColor = 0x999999ff

    var animationSpeed = 0.50

    module.exports = function (scene) {

        var imageRenderer = imports.imageRenderer(scene)
        var borderWidth = 1
        var cellsPerSector = 5

        return {

            init: function (container, allChannelList, currentChannelCellNumber, width, tileHeight) {

                // we keep track of the top most and bottom most cell indices tracked
                this.topCell = currentChannelCellNumber
                this.bottomCell = currentChannelCellNumber + cellsPerSector

                this.allChannelList = allChannelList

                this.currentYLoc = 0

                this.container = container

                // initialize a scrolling container to hold the scroll list
                var dtl = scene.create({
                    t: "object",
                    fillColor: transparentColor,
                    y: this.currentYLoc,    // position the scrolling list at the current cell
                    parent: container,
                    w: width,
                    h: tileHeight * cellsPerSector,
                    clip: false
                })

                // vertical line
                scene.create({
                    t: 'rect',
                    a: 1,
                    parent: container,
                    x: width,
                    y: 0,
                    w: 1,
                    h: this.container.h,
                    fillColor: greyColor
                })

                this.scrollingContainer = dtl;
                this.xOffset = Math.round(0.29 * this.scrollingContainer.w)
                this.tileHeight = tileHeight
                this.channelW = width - this.xOffset    // width of the tile determined after taking into account the offset and border

                return this;
            },
            tileRenderFunction: function (func) {
                // we register rendering action here for each individual tile 
                this.tileRenderFunction = func
                return this
            },
            _generateCells: function (channelList, container, yOffset) {

                var cells = []

                var t = this

                channelList.forEach(function(channel) {

                    cells.push(image({
                        t: 'rect', parent: container,
                        fillColor: transparentColor,
                        a: 1,
                        x: t.xOffset,
                        y: yOffset,
                        w: t.channelW,
                        h: t.tileHeight,
                        data: channel
                    })
                    .addEffects(
                        imageEffects()
                            .border2(0, borderWidth, 0, 0, greyColor) // only render the bottom border
                    ))

                    yOffset += t.tileHeight
                })
                return cells
            },
            render: function (callback) {

                // loops through all the channels around the current channel and builds a subset of channel data
                var channelList = []
                for (var i = this.topCell - cellsPerSector; i < this.bottomCell + cellsPerSector; i++) {
                    channelList.push(this.allChannelList[i])
                }

                this.currentSector = this._addSector(channelList.slice(cellsPerSector, 2 * cellsPerSector), -1)
                this.addTopSector(this.currentSector)
                this.addBottomSector(this.currentSector)

                callback(channelList)
            },
            // updates the position of the scrolling list. scrollYOffset is the offset that the list should scroll to
            update: function (scrollYOffset) {
                this.currentYLoc += scrollYOffset       // add the offset to the currentLocation
                this.scrollingContainer.animateTo({
                    y: this.currentYLoc,
                }, animationSpeed, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
            },
            _addSector: function (channelList, sectorY) {

                var sector = scene.create({
                    a: 1,
                    t: "rect",
                    fillColor: transparentColor,
                    y: sectorY,    // position the scrolling list at the current cell
                    parent: this.scrollingContainer,
                    w: this.scrollingContainer.w,
                    h: this.scrollingContainer.h,
                    clip: false
                });

                var f = this.tileRenderFunction

                var cells = this._generateCells(channelList, sector, borderWidth)

                // Render the cells
                imageRenderer.renderList(cells, function (channelTile) {
                    f(channelTile)                          // invoke the rendering function
                }, function () {
                    // do nothing
                })
                return {container: sector}
            },
            _removeSector: function(sector){
                if (sector.top != null) {
                    sector.top.bottom = null
                    sector.top = null
                }
                if (sector.bottom != null) {
                    sector.bottom.top = null
                    sector.bottom = null
                }
                sector.container.removeAll()
                sector.container.remove()
            },
            removeTopSector: function(relativeSector){
                // de reference the top sector and then update the top most cell index
                // also remove it from the scene
                if (relativeSector.top != null) {
                    this._removeSector(relativeSector.top)    
                    var start = this.topCell + cellsPerSector  
                    if (start < 0) {
                        this.topCell = this.allChannelList.length - start
                    } else {
                        this.topCell += cellsPerSector
                    }
                }
            },
            removeBottomSector:function(relativeSector){
                // de-reference the bottom sector and then update the bottom most cell index
                // also remove it from the scene
                if (relativeSector.bottom != null) {
                    this._removeSector(relativeSector.bottom)  
                    var end = this.bottomCell + cellsPerSector
                    if (end > this.allChannelList.length) {
                        this.bottomCell = end + this.allChannelList.length
                    } else {
                        this.bottomCell -= cellsPerSector
                    }  
                }
            },
            addTopSector: function (relativeSector) {

                // return if a top sector is already present
                if (relativeSector.top != null)
                    return

                var channelList = []

                var start = this.topCell - cellsPerSector
                if (start < 0) {
                    for (var i = start; i < 0; i++) {
                        channelList.push(this.allChannelList[this.allChannelList.length + i])
                    }
                    for (var i = 0; i < cellsPerSector + start; i++) {
                        channelList.push(this.allChannelList[i])
                    }
                    this.topCell = this.allChannelList.length + start

                } else {
                    for (var i = start; i < this.topCell; i++) {
                        channelList.push(this.allChannelList[i])
                    }
                    this.topCell -= cellsPerSector

                }
                var sectorYOffset = relativeSector.container.y - relativeSector.container.h 
                var sector = this._addSector(channelList, sectorYOffset)
                relativeSector.top = sector
                sector.bottom = relativeSector
            },
            addBottomSector: function (relativeSector) {

                // return if a bottom sector is already present
                if (relativeSector.bottom != null)
                    return

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
                var sector = this._addSector(channelList, relativeSector.container.y + relativeSector.container.h)
                relativeSector.bottom = sector
                sector.top = relativeSector
            }
        }
    }

}).catch(function (err) {
    console.error("Error on Grid selector: ")
    console.log(err)
});
