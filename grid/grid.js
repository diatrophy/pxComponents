// grid.js
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    imageEffects    : '../image/imageEffects.js',
    math            : '../math.js',
    sectors         : 'sectors.js'
}).then(function importsAreReady(imports) {

    var image = imports.image,
        imageEffects = imports.imageEffects

    var borderWidth = 1
    var DEFAULT_BUCKET_SIZE = 10

    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            sectors : imports.sectors(scene),
            init : function(listingDataInView,listingDataBottom,listingDataTop,listingDataRight,container,tileHeight) {
                this.container = container
                this.tileHeight = tileHeight
                this.listingDataInView = listingDataInView
                this.listingDataBottom = listingDataBottom
                this.listingDataRight = listingDataRight
                this.listingDataTop = listingDataTop
                return this
            },
            // handler for the individual cell
            tileRenderFunction : function(func){
                this.tileRenderFunction = func
                return this
            },
            // takes an matrix of listings (an array for each channel) and converts this to a single array of cells
            convertListingDataInViewToCells : function(listingDataInView,container,width){
                
                var cells = [],                 // array to return
                    tileH = this.tileHeight,    // for use in an inner function
                    yOffset = borderWidth,      // starting offset along the y-axis
                    c = container               // for use in an inner function

                // since the data contains the pre-calculated percentage (complexity else-where) we can easily determine the width
                var calculateCellWidth = function(percentage) {

                    var wid = DEFAULT_BUCKET_SIZE        // default to DEFAULT_BUCKET_SIZE % if the percentage data is missing 
                    if (percentage != null)
                        wid = (width * percentage) / 100
                    return wid
                }

                // use 2 nested loops to go through the matrix of listings and generate cells
                listingDataInView.forEach(function(row) {

                    var xOffset = 0,
                        prevCell = null             // track the previous cell for building the prev/next list

                    // loop through all the cells in the row
                    row.forEach(function(cellData){

                        var wid = calculateCellWidth(cellData.p)

                        // keep track of all the cells in a single array
                        cells.push(image({t:'rect',parent:c,fillColor:0x33C866,a:1,x:xOffset,y:yOffset,w:wid,h:tileH,
                            data:cellData})         // store the cell data in the image config
                            .addEffects(imageEffects().border(borderWidth,borderWidth,1,1,0x555555FF )))

                        xOffset += wid              // onto the next cell in the row
                    })

                    yOffset += tileH // + borderWidth  // onto the next row
                })

                return cells
            },
            calculateNumberOfCellBuckets : function(percentage) {

                    var buckets = 1        // default to 1 bucket 
                    if (percentage != null)
                        buckets = Math.round( percentage / DEFAULT_BUCKET_SIZE)
                    return buckets
            },
            proximitySearch : function(cells,listingDataInView){
                // the following is a loose adaptation of a linear proximity search. 
                // https://en.wikipedia.org/wiki/Nearest_neighbor_search
                // 
                // PREVIOUS / NEXT CELL
                //
                // The logic to determine the previous and next cell is straight-forward. It involves looping through
                // all the cells, and keeping a track of the previous cell while making the current cell aware
                // of the previous cell, and making the previous cell aware of the current cell.
                // 
                //
                // TOP / BOTTOM CELL
                //
                // Each row in the grid is divided into 24 numbered buckets. Each bucket is DEFAULT_BUCKET_SIZE % width of the row. 
                // Each Cell in the row
                // is then assigned to a bucket ( a cell can live in multiple buckets). With this information, a cell can now be 
                // correlated to the corresponding buckets in the row above and below it (based on the first bucket it belongs to).
                //
                // +-----+-----+-----+-----+-----+-----+-----+------
                // |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |
                // +--+--+-----+-----+-----+--+--+-----+--+--+-----+
                //    ^                       ^           ^
                // +--+-----------------------+--------+--+--------+
                // |    GOOD MORNING AMERICA           |    KELLY &|
                // +--+--+--------------------+--------+--+--+-----+
                //    ^  |                    ^           |  
                //    |  V                    |           V  
                // +--+--+---------------+----+-----------+--+-----+
                // |      TODAY SHOW     |     KATHY AND HODA      |
                // +---------------------+-------------------------+

                var rowCount = 0
                var cellCount = 0
                var prevRowTrackerMap = null

                var calculateNumberOfCellBuckets = this.calculateNumberOfCellBuckets
                
                listingDataInView.forEach(function(row) {

                    var prevCell = null
                    
                    var currentRowTrackerMap = {}
                    var currentCellTrack = DEFAULT_BUCKET_SIZE

                    var columnCount = 0

                    row.forEach(function(cellData){

                        // logic for setting the prev and next cell
                        var currentCell = cells[cellCount]

                        // determine left/right columns, in some cases left == right
                        if (columnCount == 0)
                            currentCell.config.leftColumn = true
                        if (columnCount == row.length-1)
                            currentCell.config.rightColumn = true

                        // the prev cell is aware of the next cell in the list and vice-versa
                        currentCell.config.prevCell = prevCell      // track the cell to the left
                        if (prevCell != null)
                            prevCell.config.nextCell = currentCell  // track the cell to the right
                        prevCell = currentCell

                        var currentCellBuckets = calculateNumberOfCellBuckets(currentCell.config.data.p)
                        var nT = currentCellTrack
                        for (var i = 0; i < currentCellBuckets;i++) {
                            currentRowTrackerMap[currentCellTrack] = currentCell
                            currentCellTrack += DEFAULT_BUCKET_SIZE
                        }

                        // logic for setting the above and below cell
                        if (prevRowTrackerMap != null) {
                            for (var k = nT; k < currentCellTrack;) {
                                if (prevRowTrackerMap[k] != null) {
                                    if (prevRowTrackerMap[k].config != null && prevRowTrackerMap[k].config.bottomCell == null)
                                        prevRowTrackerMap[k].config.bottomCell = currentCell
                                }
                                k += DEFAULT_BUCKET_SIZE
                            }
                            currentCell.config.topCell = prevRowTrackerMap[nT]
                        } else {
                            currentCell.config.topRow = true        // mark this as a top row in this sector
                        }

                        if (rowCount == listingDataInView.length-1)
                            currentCell.config.bottomRow = true     // mark this as a bottom row in this sector

                        cellCount++
                        columnCount++
                    })

                    prevRowTrackerMap = currentRowTrackerMap

                    rowCount++
                })
            },
            proximitySearchTopBottom : function(cells,listingDataInView){
            
                var cellCount = 0
                var prevRowTrackerMap = null

                var calculateNumberOfCellBuckets = this.calculateNumberOfCellBuckets
                
                listingDataInView.forEach(function(row) {

                    var currentRowTrackerMap = {}
                    var currentCellTrack = DEFAULT_BUCKET_SIZE

                    row.forEach(function(cellData){

                        // logic for setting the prev and next cell
                        var currentCell = cells[cellCount]
                        var currentCellBuckets = calculateNumberOfCellBuckets(currentCell.config.data.p)
                        var nT = currentCellTrack
                        for (var i = 0; i < currentCellBuckets;i++) {
                            currentRowTrackerMap[currentCellTrack] = currentCell
                            currentCellTrack += DEFAULT_BUCKET_SIZE
                        }

                        // logic for setting the above and below cell
                        if (prevRowTrackerMap != null) {
                            for (var k = nT; k < currentCellTrack;) {
                                if (prevRowTrackerMap[k] != null) {
                                    if (prevRowTrackerMap[k].config != null && prevRowTrackerMap[k].config.bottomCell == null)
                                        prevRowTrackerMap[k].config.bottomCell = currentCell
                                }
                                k += DEFAULT_BUCKET_SIZE
                            }
                            currentCell.config.topCell = prevRowTrackerMap[nT]
                        } 

                        cellCount++
                    })
                    prevRowTrackerMap = currentRowTrackerMap
              })
            },
            // takes 2 sectors and creates relationships between the last and first row of the container above and below
            bottomStitchSectors : function(topCells,topData,bottomCells,bottomData){
                
                var bottomRow = []
                for (var i = 0; i < topCells.length; i++) {         // TODO - OPTIMIZE - don't need to traverse whole array
                    if (topCells[i].config.bottomRow)               // should traverse in reverse order and then flip the result
                        bottomRow.push(topCells[i])
                }
                var topRow = []
                for (var i = 0; i < bottomCells.length; i++) {    
                    if (bottomCells[i].config.topRow)
                        topRow.push(bottomCells[i])
                    else 
                        break                                       // short circuit
                }

                var data = []
                data.push(topData[topData.length-1])
                data.push(bottomData[0])

                this.proximitySearchTopBottom(bottomRow.concat(topRow),data)
            },
             // takes 2 sectors and creates relationships between the prev and next row of the containers next to each other
            sideStitchSectors : function(leftCells,rightCells){
                
                var leftColumn = []
                for (var i = 0; i < leftCells.length; i++) {         // TODO - OPTIMIZE - don't need to traverse whole array
                    if (leftCells[i].config.rightColumn)             // should traverse in reverse order and then flip the result
                        leftColumn.push(leftCells[i])
                }
                var rightColumn = []
                for (var i = 0; i < rightCells.length; i++) {    
                    if (rightCells[i].config.leftColumn)
                        rightColumn.push(rightCells[i])
                }

                if (rightColumn.length == leftColumn.length) {

                    for (var i = 0; i < rightColumn.length; i++) {        
                        leftColumn[i].config.nextCell = rightColumn[i]
                        rightColumn[i].config.prevCell = leftColumn[i]
                    }
                } else {
                    console.log('mismatched columns' + leftColumn.length +"----"+rightColumn.length +"---" )
                }
            },
            render : function(callback){

                var c = this.container

                var f = this.tileRenderFunction             // pre-declare the function so that it is reachable in the function

                this.sectors.init(c,borderWidth)

                var sectorCurrent = this.sectors.currentSector

                var cells = this.convertListingDataInViewToCells(this.listingDataInView,sectorCurrent.container,c.w)

                this.sectors.currentSector.cells = cells
                this.sectors.currentSector.data = this.listingDataInView

                this.proximitySearch(cells,this.listingDataInView)

                this.addTopSector(this.listingDataTop,sectorCurrent)
                this.addBottomSector(this.listingDataBottom,sectorCurrent)
                this.addRightSector(this.listingDataRight,sectorCurrent)

                // Render the cells
                imageRenderer.renderList(cells,function(channelTile){
                    f(channelTile)                          // invoke the rendering function
                },function(){
                    callback(cells[0])
                })
            },
            _addCellsToSector : function(data,sector){
                var cells = this.convertListingDataInViewToCells(data,sector.container,this.container.w)
                this.proximitySearch(cells,data)
                sector.cells = cells
                sector.data = data

                var f = this.tileRenderFunction             // pre-declare the function so that it is reachable in the function
                // Render the cells
                imageRenderer.renderList(cells,function(tile){
                    f(tile)                                 // invoke the rendering function
                },function(){
                })
                return cells
            },
            // Adds a sector above the current sector and populates it with cells containing the listing data
            addTopSector : function(data,relativeSector) {

                var sector = this.sectors.extendUp(relativeSector)
                var cells = this._addCellsToSector(data,sector)
                this.bottomStitchSectors(cells,data,relativeSector.cells,relativeSector.data)
            },
            // Adds a sector below the current sector and populates it with cells containing the listing data
            addBottomSector : function(data,relativeSector) {

                var sector = this.sectors.extendDown(relativeSector)
                var cells = this._addCellsToSector(data,sector)
                this.bottomStitchSectors(relativeSector.cells,relativeSector.data,cells,data)
            },
            // Adds a sector to the right of the current sector and populates it with cells containing the listing data
            addRightSector : function(data,relativeSector) {

                var sector = this.sectors.extendRight(relativeSector)
                var cells = this._addCellsToSector(data,sector)
                this.sideStitchSectors(relativeSector.cells,cells)
            }
        }
    }
}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});
