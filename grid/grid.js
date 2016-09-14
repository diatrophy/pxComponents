// grid.js
//
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    imageEffects: '../image/imageEffects.js',
    math: '../math.js',
    sectors: 'sectors.js',
    cellRelate: 'cellRelate.js',
    gridHelper: 'gridHelper.js',
    logger: '../logger.js',
    memoryPool : '../util/memoryPool.js'

}).then(function importsAreReady(imports) {

    var image = imports.image,
        imageEffects = imports.imageEffects,
        cellRelate = imports.cellRelate(),
        gridHelper = imports.gridHelper(),
        logger = imports.logger(),
        MemoryPool = imports.memoryPool,
        memoryPool = new MemoryPool()  // TODO - make global

    var transparentColor = 0xffffff00,
        greyColor = 0x999999ff,
        borderWidth = 1

    memoryPool.register('cells', function (id) {            // image constructor

        return image({
                        id: id,
                        t: 'rect',
                        fillColor: transparentColor,
                        clip:true
                    })
                        .addEffects(imageEffects()
                            .border2(0, borderWidth, 0, borderWidth, greyColor)
                        )

    },200, function(cell){                                  // limit, and recycler callback

        cell.image.a = 0
        cell.container.parent = null
        cell.container.x = -20000
        cellRelate.unrelate(cell)
        cell.config = {}
    })

    module.exports = function (scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            sectors: imports.sectors(scene),
            init: function (listingDataInView, listingDataBottom, listingDataTop, listingDataRight,
                            listingDataTopRight, listingDataBottomRight, container, tileHeight) {
                this.container = container
                this.tileHeight = tileHeight
                this.listingDataInView = listingDataInView
                this.listingDataBottom = listingDataBottom
                this.listingDataRight = listingDataRight
                this.listingDataTop = listingDataTop
                this.listingDataTopRight = listingDataTopRight
                this.listingDataBottomRight = listingDataBottomRight
                return this
            },
            // handler for the individual cell
            tileRenderFunction: function (func) {
                this.tileRender = func
                return this
            },
            tileSelectedFunction: function (func) {
                this.tileSelected = func
                return this
            },
            render: function (callback) {

                var c = this.container,
                    sectorCurrent = this.sectors.init(c, borderWidth, c.h),
                    cells = this._addCellsToSector(this.listingDataInView, sectorCurrent, 0)

                this.addTopSector(this.listingDataTop, sectorCurrent)
                this.addBottomSector(this.listingDataBottom, sectorCurrent)
                this.addRightSector(this.listingDataRight, sectorCurrent)
                this.addTopRightSector(this.listingDataTopRight, sectorCurrent)
                this.addBottomRightSector(this.listingDataBottomRight, sectorCurrent)

                callback(cells[0])
            },
            // internal function that creates cells and adds them to a sector
            _addCellsToSector: function (data, sector, selectedIndex) {

                // helper function to create each cell
                var cellFunction = function (container, alpha, xOffset, yOffset, wid, tileH, cellData) {

                    var id = "cell-" + Math.random()

                    // var cell = memoryPool.get('cells')
                 
                    // if (cell == null) {

                    //     console.log('------------- COULD NOT RETRIEVE CELL FROM POOL -------------')

                    // } else {
                    
                    //     // if this cell was already rendered then update additional vals on it otherwise just
                    //     // update the config

                    //     cell.config.parent = container
                    //     cell.config.a = alpha
                    //     cell.config.x = xOffset
                    //     cell.config.y = yOffset
                    //     cell.config.w = wid
                    //     cell.config.h = tileH
                    //     cell.config.data = cellData

                    //     if (cell.image != null) {

                    //         cell.container.parent = container
                    //         cell.container.a = alpha
                    //         cell.container.x = xOffset
                    //         cell.container.y = yOffset
                    //         cell.container.w = cell.image.w = wid
                    //     }
                       
                        var cell = image({
                            id: id,
                            t: 'rect',
                            parent: container,
                            fillColor: transparentColor,
                            a: alpha,
                            x: xOffset,
                            y: yOffset,
                            w: wid,
                            h: tileH,
                            clip:true,
                            data: cellData // store the cell data in the image config
                        })
                            .addEffects(imageEffects()
                                .border2(0, borderWidth, 0, borderWidth, greyColor)
                            )

                        // create a circular reference so that we can use it later
                        cellData.cell = cell
                    // }

                    return cell
                }

                // first convert the data to cells and then create relationships between cells
                // also mark the cell matching the selectedIndex as `initial`
                var cells = gridHelper.convertListingDataInViewToCells(data, sector.container, this.container.w, this.tileHeight, cellFunction)

                if (selectedIndex != null) {
                    cells[selectedIndex].initialCell = true     // mark the selected cell as the initial cell
                }

                // relate each cell within a sector to each other
                cellRelate.proximitySearch(cells, data)

                sector.cells = cells
                sector.data = data

                var tileRender = this.tileRender                // pre-declare the function so that it is reachable in the function
                var tileSelected = this.tileSelected
                // Render the cells
                imageRenderer.renderList(cells, function (cell) {

                    // updates the offset of the content within the cell : if the cell will be obscured
                    var titleXOffset = 0
                    if (cell.container.x < 0)
                        titleXOffset = Math.abs(cell.container.x)

                    if (cell.config.data.placeholder != true) {
                        tileRender(cell, titleXOffset, function (c) {         // invoke the rendering function
                            c.loaded = true                     // mark the cell's contents as rendered
                            if (c.initialCell)
                                tileSelected(c)                 // if this is the initial cell, it is selected
                        })
                    }
                })

                return cells
            },
            // Adds a sector above the current sector and populates it with cells containing the listing data
            addTopSector: function (data, relativeSector) {

                var sector = this.sectors.extendUp(relativeSector)
                var cells = this._addCellsToSector(data, sector)
                cellRelate.bottomStitchSectors(cells, data, relativeSector.cells, relativeSector.data)
                return sector
            },
            addTopRightSector: function (data, relativeSector) {

                var t = relativeSector.top,
                    r = relativeSector.right,
                    sector = this.sectors.extendRight(t)

                // relate the new sector with the sector to the right of this
                sector.bottom = r
                r.top = sector

                var cells = this._addCellsToSector(data, sector)
                cellRelate.sideStitchSectors(t.cells, cells)
                cellRelate.bottomStitchSectors(cells, data, r.cells, r.data)
            },
            addTopLeftSector: function (data, relativeSector) {

                var t = relativeSector.top,
                    l = relativeSector.left,
                    sector = this.sectors.extendLeft(t)

                // relate the new sector with the sector to the right of this
                sector.bottom = l
                l.top = sector

                var cells = this._addCellsToSector(data, sector)
                // console.log(data)
                // cellRelate.bottomStitchSectors(cells, data, r.cells, r.data)
                // cellRelate.sideStitchSectors(cells,t.cells)
            },
            addBottomRightSector: function (data, relativeSector) {

                var r = relativeSector.right,
                    b = relativeSector.bottom,
                    sector = this.sectors.extendRight(b)

                // relate the new sector with the sector to the right of this
                sector.top = r
                r.bottom = sector

                var cells = this._addCellsToSector(data, sector)

                cellRelate.sideStitchSectors(b.cells, cells)
                cellRelate.bottomStitchSectors(r.cells, r.data, cells, data)
            },
            // Adds a sector below the current sector and populates it with cells containing the listing data
            addBottomSector: function (data, relativeSector) {

                var sector = this.sectors.extendDown(relativeSector)
                var cells = this._addCellsToSector(data, sector)
                cellRelate.bottomStitchSectors(relativeSector.cells, relativeSector.data, cells, data)
            },
            _removeSector: function(sector) {
       
                if (sector.cells != null)
                    sector.cells.forEach(function(cell){
                        memoryPool.recycle('cells',cell)
                    })

                sector.cells = null
                sector.data = null
                this.sectors.remove(sector)
            },
            removeTopSector: function(relativeSector) {
                // if a sector exists to the top - then remove it from the scene and de-reference
                if (relativeSector.top != null) {
                    this._removeSector(relativeSector.top)
                }
            },
            removeTopRightSector: function(relativeSector) {
                // if a sector exists to the top right - then remove it from the scene and de-reference
                if (relativeSector.top != null && relativeSector.top.right != null) {
                    this._removeSector(relativeSector.top.right)
                }
            },
            removeBottomSector: function(relativeSector) {
                // if a sector exists to the bottom - then remove it from the scene and de-reference
                if (relativeSector.bottom != null) {
                    this._removeSector(relativeSector.bottom)
                }
            },
            removeBottomRightSector: function(relativeSector) {
                // if a sector exists to the bottom right - then remove it from the scene and de-reference
                if (relativeSector.bottom != null && relativeSector.bottom.right != null) {
                   this. _removeSector(relativeSector.bottom.right)
                }
            },
            // Adds a sector to the right of the current sector and populates it with cells containing the listing data
            addRightSector: function (data, relativeSector) {
                var sector = this.sectors.extendRight(relativeSector)
                var cells = this._addCellsToSector(data, sector)
                cellRelate.sideStitchSectors(relativeSector.cells, cells)
                return sector
            }
        }
    }
}).catch(function (err) {
    console.error("Error on Grid : ")
    console.log(err)
});
