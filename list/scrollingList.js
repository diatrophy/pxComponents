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
    circularArray : '../util/circularArray.js'

}).then(function importsAreReady(imports) {

    var image = imports.image,
        imageEffects = imports.imageEffects,
        CircularArray = imports.circularArray,
        math = imports.math(),
        transparentColor = 0xffffff00,
        greyColor = 0x999999ff,
        animationSpeed = 0.50

    module.exports = function (scene,memoryPool) {

        var imageRenderer = imports.imageRenderer(scene),
            borderWidth = 1,
            cellsPerSector = 5

        // constructor for creating a sector
        var sectorConstructor = function(){     

            return {
                container: scene.create({
                    id : 'sector-' + Math.random(),
                    a: 1,
                    t: "rect",
                    fillColor: transparentColor,
                    clip: false
                }),
                cells:null
            }
        }

        // register a managed memory pool to allow re-use of sectors and cells in the list
        if (memoryPool != null)
            memoryPool.register('scrollingTile',sectorConstructor)

        return {

            // initialize the scrolling list with -
            // container - to hold the scrolling list
            // items - **circular array*** of items in the scrolling list, data format can be any form (literal or hash map). The 
            //          content of the data is passed through to the tile rendering function
            // currentCellNumber - to highlight 
            // width - of the scrolling list 
            // tileHeight - height of each time
            // circular - indicates whether items repeat
            init: function (container, items, currentCellNumber, width, tileHeight, scrollingListXOffset, circular, tilePadding,
                topBorderWidth, bottomBorderWidth, leftBorderWidth,rightBorderWidth,cellColor) {

                this.tilePadding = tilePadding == null ? 0 : tilePadding
                this.topBorderWidth = topBorderWidth == null ? 0 : topBorderWidth
                this.bottomBorderWidth = bottomBorderWidth == null ? 0 : bottomBorderWidth
                this.leftBorderWidth = leftBorderWidth == null ? 0 : leftBorderWidth
                this.rightBorderWidth = rightBorderWidth == null ? 0 : rightBorderWidth
                this.cellColor = cellColor

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

                return this
            },
            // we register rendering action here for each individual tile 
            tileRenderFunction: function (func) {
                this.tileRenderFunction = func
                return this
            },
            // loop through all the items and generate pxComponent images. Nothing is rendered yet.
            _generateCells: function (items, container, yOffset, xOffset, width, height, tilePadding, 
                topBorderWidth, bottomBorderWidth, leftBorderWidth, rightBorderWidth, cellColor) {

                if (tilePadding == null)
                    tilePadding = 0

                var cells = items.map(function (item, i) {

                    return image({
                        t: 'rect',
                        parent: container,
                        fillColor: cellColor == null ? transparentColor : cellColor,
                        a: 1,
                        x: xOffset,
                        y: yOffset + ( height * i ),
                        w: width,
                        h: height - tilePadding,
                        data: item
                    }).addEffects(
                        imageEffects()
                            .border2(topBorderWidth, bottomBorderWidth, leftBorderWidth, rightBorderWidth, greyColor) // only render the bottom border
                        )
                })

                var prevCell = null
                cells.forEach(function(cell,i){
                    if (i > 0) {
                        cell.config.prevCell = cells[i-1]
                        cell.config.prevCell.config.nextCell = cell
                    }
                })

                return cells
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

                callback(currentItems,this.currentSector.cells[0])
            },
            // updates the position of the scrolling list. scrollYOffset is the offset that the list should scroll to
            update: function (scrollYOffset) {
                this.currentYLoc += scrollYOffset       // add the offset to the currentLocation
                this.scrollingContainer.animateTo({
                    y: this.currentYLoc,
                }, animationSpeed, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
            },
            // creates a new sector with the passed in items at the y offset
            _addSector: function (items, sectorY) {

                var sector,
                    f = this.tileRenderFunction

                // get a new sector via the memory pool OR constructor
                var sector = memoryPool != null ? memoryPool.get('scrollingTile') : sectorConstructor()

                sector.container.y = sectorY    // position the scrolling list at the current cell
                sector.container.parent = this.scrollingContainer
                sector.container.w = this.scrollingContainer.w
                sector.container.h = this.scrollingContainer.h

                // create cells if they don't exist otherwise re-purpose the existing cells in the sector 
                // with new data
                if (sector.cells == null) {

                    var cells = this._generateCells(items, sector.container, borderWidth, this.xOffset, this.itemW, 
                        this.tileHeight, this.tilePadding, this.topBorderWidth, this.bottomBorderWidth,
                        this.leftBorderWidth, this.rightBorderWidth, this.cellColor)

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
            // removing a sector involves removing any references to it 
            _removeSector: function (sector) {
                if (sector.top != null) {
                    sector.top.bottom = null
                    sector.top = null
                }
                if (sector.bottom != null) {
                    sector.bottom.top = null
                    sector.bottom = null
                }

                // mark and save the sector for reuse if a memory pool exists otherwise 
                // use the px remove function to remove it
                if (memoryPool != null)
                    memoryPool.recycle('scrollingTile',sector)
                else {
                    sector.container.remove()
                    sector.cells = null
                }
            },
            // de reference the top sector and then update the top most cell index
            // also remove it from the scene
            removeTopSector: function (relativeSector) {    
                if (relativeSector.top != null) {
                    this._removeSector(relativeSector.top)
                    this.topCell = this.items.getTranslatedVal(this.topCell + cellsPerSector)
                }
            },
            // de-reference the bottom sector and then update the bottom most cell index
            // also remove it from the scene
            removeBottomSector: function (relativeSector) {
                if (relativeSector.bottom != null) {
                    this._removeSector(relativeSector.bottom)
                    this.bottomCell = this.items.getTranslatedVal(this.bottomCell - cellsPerSector)
                }
            },
            // adds a new sector above this sector
            addTopSector: function (relativeSector) {

                if (relativeSector.top == null) {

                    // compute the start and end for the list of items above the current sector
                    // and fetch the list
                    var start = this.topCell - cellsPerSector,
                        end = this.topCell

                    if (!this.circular) 
                        start = math.valBetween(start,0,this.items.length)
                    
                    var itemList = this.items.slice(start, end)

                    if (itemList.length > 0) {
                        this.topCell = this.circular ? this.items.getTranslatedVal(start) : start

                        relativeSector.top = this._addSector(itemList, relativeSector.container.y - relativeSector.container.h)
                        relativeSector.top.bottom = relativeSector

                        // associate last cell in top sector to the first cell in the bottom sector
                        relativeSector.top.cells[relativeSector.top.cells.length - 1].config.nextCell = relativeSector.cells[0]
                    }
                }
            },
            // adds a new sector below this sector
            addBottomSector: function (relativeSector) {

                // compute the start and end for the list of items above the current sector
                // and fetch the list
                if (relativeSector.bottom == null) {
                    var start = this.bottomCell,
                        end = this.bottomCell + cellsPerSector

                    if (!this.circular) 
                        end = math.valBetween(end,0,this.items.length)
                  
                    var itemList = this.items.slice(start, end)

                    if (itemList.length > 0) {
                        
                        this.bottomCell = this.circular ? this.items.getTranslatedVal(end) : end

                        relativeSector.bottom = this._addSector(itemList, relativeSector.container.y + relativeSector.container.h)
                        relativeSector.bottom.top = relativeSector

                        console.log('-------- adding bottom sector -------' + relativeSector.cells.length)

                        // associate last cell in top sector to the first cell in the bottom sector
                        relativeSector.cells[relativeSector.cells.length-1].config.nextCell = relativeSector.bottom.cells[0]
                        relativeSector.bottom.cells[0].config.prevCell = relativeSector.cells[relativeSector.cells.length-1]
                    }
                }
            }
        }
    }

}).catch(function (err) {
    console.error("Error on scrolling list: ")
    console.log(err.stack)
});
