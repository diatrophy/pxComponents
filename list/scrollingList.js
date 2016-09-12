// scrollingList.js
//
// This evolved as a scrolling list for the channels in the grid, but is evolving into a generic
// scrolling list for items
//
// The scrolling list dynamically generates and then adds/removes sectors as the user moves up or
// down
//
// +----------------+
// |                |
// |                |
// |  top  sector   |
// |                |
// |                |
// +----------------+
// +----------------+
// |                |
// |                |
// |  current sect  |
// |                |
// |                |
// +----------------+
// +----------------+
// |                |
// |                |
// |  bottom sec    |
// |                |
// |                |
// +----------------+
// 
// 
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    imageEffects: '../image/imageEffects.js',
    math: '../math.js',
    circularArray : '../util/circularArray.js',
    memoryPool : '../util/memoryPool.js'

}).then(function importsAreReady(imports) {

    var image = imports.image,
        imageEffects = imports.imageEffects,
        CircularArray = imports.circularArray,
        MemoryPool = imports.memoryPool,
        memoryPool = new MemoryPool(),  // TODO - make global
        math = imports.math(),
        transparentColor = 0xffffff00,
        greyColor = 0x999999ff,
        animationSpeed = 0.50

    module.exports = function (scene) {

        var imageRenderer = imports.imageRenderer(scene),
            borderWidth = 1,
            cellsPerSector = 5

        memoryPool.register('scrollingTile',function(){

            return {
                container: scene.create({
                    a: 1,
                    t: "rect",
                    fillColor: transparentColor,
                    clip: false
                }),
                cells:null
            }
        })

        return {

            // initialize the scrolling list with -
            // container - to hold the scrolling list
            // items - **circular array*** of items in the scrolling list, data format can be any form (literal or hash map). The 
            //          content of the data is passed through to the tile rendering function
            // currentCellNumber - to highlight 
            // width - of the scrolling list 
            // tileHeight - height of each time
            // circular - indicates whether items repeat
            init: function (container, items, currentCellNumber, width, tileHeight, scrollingListXOffset, circular) {

                // we keep track of the top most and bottom most cell indices tracked
                this.topCell = currentCellNumber
                if (items.length > cellsPerSector)
                    this.bottomCell = currentCellNumber + cellsPerSector
                else
                    this.bottomCell = currentCellNumber + items.length

                // store the passed in params as object variables
                this.items = items
                this.container = container
                this.xOffset = scrollingListXOffset
                this.tileHeight = tileHeight

                // sections repeat after scrolling to the bottom
                if (circular != null && circular) {
                    this.circular = circular
                    this.items = new CircularArray(items)
                } else {
                    this.circular = false
                    this.items = items
                }

                // initialize the current Y location (of the scrolling container to 0)
                this.currentYLoc = 0

                // width of the tile determined after taking into account the offset and border
                this.itemW = width - this.xOffset

                // initialize a container to hold the scroll list. This will be the container that scrolling up and down
                this.scrollingContainer = scene.create({
                    t: "object",
                    fillColor: transparentColor,
                    y: this.currentYLoc,    // position the scrolling list at the current cell
                    parent: container,
                    w: width,
                    h: tileHeight * cellsPerSector,
                    clip: false
                })

                // vertical line
                // TODO - make this configurable, or extract this out of this object
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

                return this
            },
            // we register rendering action here for each individual tile 
            tileRenderFunction: function (func) {
                this.tileRenderFunction = func
                return this
            },
            // loop through all the items and generate pxComponent images. Nothing is rendered yet.
            _generateCells: function (items, container, yOffset, xOffset, width, height) {

                return items.map(function (item, i) {

                    return image({
                        t: 'rect',
                        parent: container,
                        fillColor: transparentColor,
                        a: 1,
                        x: xOffset,
                        y: yOffset + height * i,
                        w: width,
                        h: height,
                        data: item
                    }).addEffects(
                        imageEffects()
                            .border2(0, borderWidth, 0, 0, greyColor) // only render the bottom border
                        )
                })
            },
            // initial rendering method invoked to render the starting list
            render: function (callback) {

                // the intial data set will contains items above and below the sector containing the current item
                var currentItems = this.items.slice(this.topCell - cellsPerSector, this.bottomCell + cellsPerSector)

                var currentSectorItems = this.items.slice(this.topCell, this.bottomCell),
                    topSectorItems = this.items.slice(this.topCell - cellsPerSector, this.bottomCell)

                // render the current sector and the sectors above and below it
                this.currentSector = this._addSector(currentSectorItems, -1)
                this.addTopSector(this.currentSector)
                this.addBottomSector(this.currentSector)

                callback(currentItems)
            },
            // updates the position of the scrolling list. scrollYOffset is the offset that the list should scroll to
            // TODO - maybe evolve this, or add another function to update position based on the index, rather than
            // y location
            update: function (scrollYOffset) {
                this.currentYLoc += scrollYOffset       // add the offset to the currentLocation
                this.scrollingContainer.animateTo({
                    y: this.currentYLoc,
                }, animationSpeed, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
            },
            _addSector: function (items, sectorY) {

                var sector,
                    f = this.tileRenderFunction

                var sector = memoryPool.get('scrollingTile')
                sector.container.y = sectorY    // position the scrolling list at the current cell
                sector.container.parent = this.scrollingContainer
                sector.container.w = this.scrollingContainer.w
                sector.container.h = this.scrollingContainer.h

                if (sector.cells == null) {

                    var cells = this._generateCells(items, sector.container, borderWidth, this.xOffset, this.itemW, this.tileHeight)

                    sector['cells'] = cells

                    imageRenderer.renderList(cells, function (itemTile) {
                        f(itemTile)                          // invoke the rendering function
                    })

                } else {
                    sector.cells.forEach(function(cell,i){
                        cell.config.data = items[i]
                        f(cell)
                    })
                }
                
                return sector
            },
            _removeSector: function (sector) {
                if (sector.top != null) {
                    sector.top.bottom = null
                    sector.top = null
                }
                if (sector.bottom != null) {
                    sector.bottom.top = null
                    sector.bottom = null
                }

                // mark and save the sector for reuse
                memoryPool.recycle('scrollingTile',sector)
            },
            removeTopSector: function (relativeSector) {
                // de reference the top sector and then update the top most cell index
                // also remove it from the scene
                if (relativeSector.top != null) {
                    this._removeSector(relativeSector.top)
                    this.topCell = this.items.getTranslatedVal(this.topCell + cellsPerSector)
                }
            },
            removeBottomSector: function (relativeSector) {
                // de-reference the bottom sector and then update the bottom most cell index
                // also remove it from the scene
                if (relativeSector.bottom != null) {
                    this._removeSector(relativeSector.bottom)
                    this.bottomCell = this.items.getTranslatedVal(this.bottomCell - cellsPerSector)
                }
            },
            // adds a new sector above this sector
            addTopSector: function (relativeSector) {

                if (relativeSector.top == null) {

                    var start = this.topCell - cellsPerSector,
                        end = this.topCell,
                        itemList = this.items.slice(start, end)

                    if (!this.circular) 
                        start = math.valBetween(start,0,this.items.length)
                    
                    this.topCell = this.circular ? this.items.getTranslatedVal(start) : start

                    relativeSector.top = this._addSector(itemList, relativeSector.container.y - relativeSector.container.h)
                    relativeSector.top.bottom = relativeSector
                }
            },
            // adds a new sector below this sector
            addBottomSector: function (relativeSector) {

                // return if a bottom sector is already present
                if (relativeSector.bottom == null) {
                    var start = this.bottomCell,
                        end = this.bottomCell + cellsPerSector,
                        itemList = this.items.slice(start, end)

                    if (!this.circular) 
                        end = math.valBetween(end,0,this.items.length)
                  
                    this.bottomCell = this.circular ? this.items.getTranslatedVal(end) : end

                    relativeSector.bottom = this._addSector(itemList, relativeSector.container.y + relativeSector.container.h)
                    relativeSector.bottom.top = relativeSector
                }
            }
        }
    }

}).catch(function (err) {
    console.error("Error on scrolling list: ")
    console.log(err.stack)
});
