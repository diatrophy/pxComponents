// grid.js
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

    var borderWidth = 1
    var DEFAULT_BUCKET_SIZE = 10

    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            
            init : function(listingDataInView,container,tileHeight) {
                this.container = container
                this.tileHeight = tileHeight
                this.listingDataInView = listingDataInView
                this.cells = []
                return this
            },
            // handler for the individual cell
            tileRenderFunction : function(func){
                this.tileRenderFunction = func
                return this
            },
            // takes an matrix of listings (an array for each channel) and converts this to a single array of cells
            convertListingDataInViewToCells : function(listingDataInView){
                
                var cells = [],                 // array to return
                    tileH = this.tileHeight,    // for use in an inner function
                    yOffset = borderWidth,      // starting offset along the y-axis
                    c = this.container          // for use in an inner function

                // since the data contains the pre-calculated percentage (complexity else-where) we can easily determine the width
                var calculateCellWidth = function(percentage) {

                    var wid = DEFAULT_BUCKET_SIZE        // default to DEFAULT_BUCKET_SIZE % if the percentage data is missing 
                    if (percentage != null)
                        wid = (c.w * percentage) / 100
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

                    yOffset += tileH + borderWidth  // onto the next row
                })

                return cells
            },
            proximitySearch : function(cells){
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

                var calculateNumberOfCellBuckets = function(percentage) {

                    var buckets = 1        // default to 1 bucket 
                    if (percentage != null)
                        buckets = Math.round( percentage / DEFAULT_BUCKET_SIZE)
                    return buckets
                }
                
                this.listingDataInView.forEach(function(row) {

                    var prevCell = null
                    
                    var currentRowTrackerMap = {}
                    var currentCellTrack = DEFAULT_BUCKET_SIZE

                    row.forEach(function(cellData){

                        // logic for setting the prev and next cell
                        var currentCell = cells[cellCount]
                        
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
                        }

                        cellCount++
                    })

                    prevRowTrackerMap = currentRowTrackerMap

                    rowCount++
                })
            },
            render : function(callback){
                console.log(' in hereeeeee')

                var c = this.container

                var f = this.tileRenderFunction             // pre-declare the function so that it is reachable in the function

                var cells = this.convertListingDataInViewToCells(this.listingDataInView)
                this.cells = cells
                this.proximitySearch(cells)
                
                // Render the cells
                imageRenderer.renderList(cells,function(channelTile){
                        f(channelTile)              // invoke the rendering function
                },function(){
                     callback() 
                })
            }
        }
    }
}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});
