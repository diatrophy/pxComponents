// grid.js
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    imageEffects    : '../image/imageEffects.js',
    math            : '../math.js',
    sectors         : 'sectors.js',
    cellRelate      : 'cellRelate.js',
    gridHelper      : 'gridHelper.js'
}).then(function importsAreReady(imports) {

    var image = imports.image,
        imageEffects = imports.imageEffects,
        cellRelate = imports.cellRelate(),
        gridHelper = imports.gridHelper()

    var borderWidth = 1

    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            sectors : imports.sectors(scene),
            init : function(listingDataInView,listingDataBottom,listingDataTop,listingDataRight,
                            listingDataTopRight,listingDataBottomRight,container,tileHeight) {
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
            tileRenderFunction : function(func){
                this.tileRender = func
                return this
            },
            tileSelectedFunction : function(func) {
                this.tileSelected = func
                return this
            },
            render : function(callback){

                var c = this.container

                var sectorCurrent = this.sectors.init(c,borderWidth,this.tileHeight*5)

                var cells = this._addCellsToSector(this.listingDataInView,sectorCurrent,0)

                this.addTopSector(this.listingDataTop,sectorCurrent)
                this.addBottomSector(this.listingDataBottom,sectorCurrent)
                this.addRightSector(this.listingDataRight,sectorCurrent)
                this.addTopRightSector(this.listingDataTopRight,sectorCurrent)
                this.addBottomRightSector(this.listingDataBottomRight,sectorCurrent)

                callback(cells[0])
            },
            // internal function that creates cells and adds them to a sector
            _addCellsToSector : function(data,sector,selectedIndex){

                var cellFunction = function(container,alpha,xOffset,yOffset,wid,tileH,cellData){
                    return image({
                        t: 'rect',
                        parent: container,
                        fillColor: 0x33C866,
                        a: alpha,
                        x: xOffset,
                        y: yOffset,
                        w: wid,
                        h: tileH,
                        data: cellData // store the cell data in the image config
                    }).addEffects(imageEffects().border(borderWidth, borderWidth, 1, 1, 0x555555FF))
                }

                // first convert the data to cells and then create relationships between cells
                // also mark the cell matching the selectedIndex as `initial`
                var cells = gridHelper.convertListingDataInViewToCells(data,sector.container,this.container.w,this.tileHeight,cellFunction)

                if (selectedIndex != null)
                    cells[selectedIndex].initialCell = true

                cellRelate.proximitySearch(cells,data)

                sector.cells = cells
                sector.data = data

                var tileRender = this.tileRender                // pre-declare the function so that it is reachable in the function
                var tileSelected = this.tileSelected
                // Render the cells
                imageRenderer.renderList(cells,function(cell){
                    if (cell.placeholder != true) {
                        tileRender(cell, function (c) {         // invoke the rendering function
                            c.loaded = true                     // mark the cell's contents as rendered
                            if (c.initialCell)
                                tileSelected(c)                 // if this is the initial cell, it is selected
                        })
                    }
                },function(cells){
                    // nothing to do post tile rendering
                })

                return cells
            },
            // Adds a sector above the current sector and populates it with cells containing the listing data
            addTopSector : function(data,relativeSector) {

                var sector = this.sectors.extendUp(relativeSector)
                var cells = this._addCellsToSector(data,sector)
                cellRelate.bottomStitchSectors(cells,data,relativeSector.cells,relativeSector.data)
                return sector
            },
            addTopRightSector : function(data,relativeSector) {

                var t = relativeSector.top
                var r = relativeSector.right
                var sector = this.sectors.extendRight(t)

                var cells = this._addCellsToSector(data,sector)
                cellRelate.bottomStitchSectors(cells,data,r.cells,r.data)
                cellRelate.sideStitchSectors(t.cells,cells)
            },
            addBottomRightSector : function(data,relativeSector) {

                var r = relativeSector.right
                var b = relativeSector.bottom

                var sector = this.sectors.extendRight(b)
                var cells = this._addCellsToSector(data,sector)
                cellRelate.bottomStitchSectors(r.cells,r.data,cells,data)
                cellRelate.sideStitchSectors(b.cells,cells)
            },
            // Adds a sector below the current sector and populates it with cells containing the listing data
            addBottomSector : function(data,relativeSector) {

                var sector = this.sectors.extendDown(relativeSector)
                var cells = this._addCellsToSector(data,sector)
                cellRelate.bottomStitchSectors(relativeSector.cells,relativeSector.data,cells,data)
            },
            // Adds a sector to the right of the current sector and populates it with cells containing the listing data
            addRightSector : function(data,relativeSector) {
                var sector = this.sectors.extendRight(relativeSector)
                var cells = this._addCellsToSector(data,sector)
                cellRelate.sideStitchSectors(relativeSector.cells,cells)

            }
        }
    }
}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});
