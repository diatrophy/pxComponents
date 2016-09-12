// cellRelate.js
//
// Logic to relate cells within a grid to each other, and cells across sectors
//
// Jason Coelho

px.import({
    gridHelper: 'gridHelper.js',
    logger: '../logger.js'
}).then(function importsAreReady(imports) {

    var gridHelper = imports.gridHelper(),
        logger = imports.logger(),
        // map containining converse directions, for ease of processing
        opps = {
            'bottom':'top',
            'top' : 'bottom',
            'next' : 'prev',
            'prev' : 'next'
        }

    module.exports = function () {

        return {
            // logic for setting the above and below cell. top/bottom cells are not complementary
            // as indicated by the diagram in the header documentation
            _topBottomMatch : function(prevRowTracker,currentCell){

                var startTime = currentCell.config.data.s,
                    endTime = currentCell.config.data.e,
                    cell = currentCell

                prevRowTracker.forEach(function(prevCell){
                    if (prevCell.config.bottomCell == null && (     // not already set
                            prevCell.config.data.s == startTime || 
                            (prevCell.config.data.s > startTime && prevCell.config.data.s < endTime) ||
                            (prevCell.config.data.o < 0 && cell.config.data.o < 0) ||
                            (prevCell.config.data.o < 0 && startTime < prevCell.config.data.e))) {

                                if (cell.config.data.placeholder)
                                    cell = cell.config.prevCell

                                prevCell.config.bottomCell = cell
                    }
                    if (cell.config.topCell == null && (            // not already set
                            startTime == prevCell.config.data.s ||
                            (startTime > prevCell.config.data.s && startTime < prevCell.config.data.e) ||
                            (cell.config.data.o < 0) )) {          // if the current cell is the first in-window     
                        
                                cell.config.topCell = prevCell
                    }
                })
            },
            proximitySearch: function (cells, listingDataInView) {

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
                // Each row in the grid is divided into numbered buckets. Each bucket is DEFAULT_BUCKET_SIZE % width of the row.
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

                var cellCount = 0,
                    prevRowTracker = null,
                    t = this

                listingDataInView.forEach(function (row,rowIndex) {               // 1st loop - channels

                    var prevCell = null,
                        currentRowTracker = []

                    if (row.length == 0) {
                        row.push({}) // push a dummy val so that the following loop executes
                    }

                    // loops through all the listings per channel.
                    row.forEach(function (cellData,columnIndex) {                     // 2nd loop - channel listings

                        var currentCell = cells[cellCount]

                        currentRowTracker.push(currentCell)

                        // logic for setting the prev and next cell
                        // determine left/right columns, in some cases left == right (because single cell rows)
                        if (columnIndex == 0)
                            currentCell.config.leftColumn = true
                        if (columnIndex == row.length - 1)
                            currentCell.config.rightColumn = true
                    
                        // the easy part - linking the previous cell to the next and vice-versa
                        currentCell.config.prevCell = prevCell          // track the cell to the left (previous)
                        if (prevCell != null)
                            prevCell.config.nextCell = currentCell      // track the cell to the right (next)
                        prevCell = currentCell

                        if (prevRowTracker != null) {
                            t._topBottomMatch(prevRowTracker,currentCell)
                        } 

                        if (rowIndex == listingDataInView.length - 1)
                            currentCell.config.bottomRow = true         // mark this as a bottom row in this sector
                        else if (rowIndex == 0)
                            currentCell.config.topRow = true

                        cellCount++
                    })

                    prevRowTracker = currentRowTracker
                })
            },
            // helper method for relating rows of top-bottom adjoining sectors
            _proximitySearchTopBottom: function (cells, listingDataInView) {

                var cellCount = 0,
                    prevRowTracker = null,
                    t = this

                listingDataInView.forEach(function (row) {               // 1st loop - channels

                    var currentRowTracker = []

                    if (row.length == 0) {
                        row.push({}) // push a dummy val so that the following loop executes
                    }

                    // loops through all the listings per channel.
                    row.forEach(function (cellData) {                     // 2nd loop - channel listings

                        var currentCell = cells[cellCount]

                        currentRowTracker.push(currentCell)

                        if (prevRowTracker != null) {
                            
                            t._topBottomMatch(prevRowTracker,currentCell)

                            // if the top cell is still null, then use the top cell of the previous cell instead
                            if (currentCell.config.topCell == null && currentCell.config.prevCell != null)
                                currentCell.config.topCell = currentCell.config.prevCell.config.topCell
                        } 
                        cellCount++
                    })

                    prevRowTracker = currentRowTracker
                })
            },
            // returns an array containing the bottom rows of a group of cells
            _getBottomRow: function (cells) {
                return cells.filter(function(cell){
                    return cell.config.bottomRow
                })
            },
            // returns an array containing the top rows of a group of cells
            _getTopRow: function (cells) {
                return cells.filter(function(cell){
                    return cell.config.topRow
                })
            },
            // takes 2 sectors and creates relationships between the last and first row of the container above and below
            bottomStitchSectors: function (topCells, topData, bottomCells, bottomData) {

                var bottomRow = this._getBottomRow(topCells),
                    topRow = this._getTopRow(bottomCells),
                    // create a new data set containing the bottom row of the top sector, and the top row of the bottom sector
                    data = [topData[topData.length - 1], bottomData[0]]

                this._proximitySearchTopBottom(bottomRow.concat(topRow), data)

                // loop through the bottom row (of the top cells) to figure out if any of the cells are missing `bottomCell`
                // if so, use the bottom cell of the prevCell
                bottomRow.forEach(function(cell){
                    if (cell.config.bottomCell == null) {
                        if (cell.config.prevCell != null && cell.config.prevCell.config.bottomCell != null) {
                            var bottomCell = cell.config.prevCell.config.bottomCell
                            if (bottomCell.config.data.placeholder)
                                bottomCell = bottomCell.config.prevCell
                            cell.config.bottomCell = cell.config.prevCell.config.bottomCell
                        }
                    }
                })
            },
            // de-reference the top most row of the sector below the cells passed in
            bottomUnStitchSector: function (cells) {

                var bottomRow = this._getBottomRow(cells)

                bottomRow.forEach(function (cell) {
                    if (cell.config.bottomCell != null)
                        cell.config.bottomCell.config.topCell = null    // first deference the bottom cell from pointing to this cell
                    cell.config.bottomCell = null                       // then remove the reference to the bottom cell
                })
            },
            // de-reference the bottom most row of the sector above the cells passed in
            topUnStitchSector: function (bottomCells) {

                var topRow = this._getTopRow(bottomCells)
                topRow.forEach(function (cell) {
                    if (cell.config.topCell != null)
                        cell.config.topCell.config.bottomCell = null    // first de-reference the top cell from pointing to this cell
                    cell.config.topCell = null                          // then remove the reference to the top cell
                })
            },
            // returns an array containing the left column
            _getLeftColumn : function(cells) {
                return cells.filter(function(cell){
                    return ((cell.config.data.placeholder == true) || cell.config.leftColumn)
                })
            },
            // returns an array containing the right column
            _getRightColumn : function(cells) {
                return cells.filter(function(cell){
                    return ((cell.config.data.placeholder == true) || cell.config.rightColumn)
                })
            },
            // de-reference the cells on the left side
            leftUnStitchSector: function (cells) {

                var leftColumn = this._getLeftColumn(cells)
                leftColumn.forEach(function (cell) {
                    if (cell.config.prevCell != null)
                        cell.config.prevCell.config.nextCell = null     // first de-reference the prev cell from pointing to this cell
                    cell.config.prevCell = null                         // then remove the reference to the prev cell
                })
            },
            // de-reference the cells on the right side
            rightUnStitchSector: function (cells) {

                var rightColumn = this._getRightColumn(cells)
                rightColumn.forEach(function (cell) {
                    if (cell.config.nextCell != null)
                        cell.config.nextCell.config.prevCell = null     // first de-reference the next cell from pointing to this cell
                    cell.config.nextCell = null                         // then remove the reference to the next cell
                })
            },
            unrelate : function(cell){
                
                for (var key in opps) {
                    if (cell.config[key+'Cell'] != null) {
                        if (cell.config[key +'Cell'].config != null)
                            cell.config[key +'Cell'].config[opps[key]+'Cell'] = null
                    }
                }
            },
            // relates 2 adjoining columns
            // alos has logic to handle overlapped cells
            _stitchColumns: function(leftColumn,rightColumn){

                // loop through the left column and create relation to the right column
                leftColumn.forEach(function(leftCell,i){

                    // creates relationships between the prev and next columns of the containers next to each other
                    leftCell.config.nextCell = rightColumn[i]
                    rightColumn[i].config.prevCell = leftCell

                    // create top relationships for the right column if they weren't previously created - perhaps because
                    // the top cell is in the previous sector
                    if (rightColumn[i].config.topCell == null && i-1 >= 0) {

                        var topCell = leftColumn[i-1] 
                        // use the prev cell if placeholder
                        while (topCell.config.data.placeholder)
                            topCell = topCell.config.prevCell

                        rightColumn[i].config.topCell = topCell 

                        // loop through the cells next to the right cell and if they are missing 
                        // a top cell, use the cell top of the left cell
                        var matched = true
                        var nextRightCell = rightColumn[i].config.nextCell
                        while(matched && nextRightCell != null) {
                            if (nextRightCell.config.topCell == null) {
                                nextRightCell.config.topCell = topCell
                                nextRightCell = nextRightCell.config.nextCell
                            } else     
                                matched = false
                        }
                    }

                    // check if the right cell is missing a bottomCell, if so, then use the cell below the 
                    // left cell.
                    if (rightColumn[i].config.bottomCell == null && i+1 < rightColumn.length) {

                        var bottomCell = leftColumn[i+1]
                        // use the previous cell if placeholder
                        while (bottomCell.config.data.placeholder)
                            bottomCell = bottomCell.config.prevCell

                        rightColumn[i].config.bottomCell = bottomCell

                        // loop through the cells next to the right cell and if they are missing 
                        // a bottom cell, use the cell below the left cell
                        var matched = true
                        var nextRightCell = rightColumn[i].config.nextCell
                        while(matched && nextRightCell != null) {
                            if (nextRightCell.config.bottomCell == null) {
                                nextRightCell.config.bottomCell = bottomCell
                                nextRightCell = nextRightCell.config.nextCell
                            } else     
                                matched = false
                        }
                    }
                })
            },
            // relates 2 adjoining sectors
            sideStitchSectors: function (leftCells, rightCells) {

                var leftCellsRightColumn = this._getRightColumn(leftCells),
                    rightCellsLeftColumn = this._getLeftColumn(rightCells)

                if (rightCellsLeftColumn.length == leftCellsRightColumn.length) {
                    this._stitchColumns(leftCellsRightColumn,rightCellsLeftColumn)
                } else 
                    console.log('mismatched columns - ' + 
                        leftCellsRightColumn.length + "----" + rightCellsLeftColumn.length + 
                        " --- " + "original lengths - " +
                        leftCells.length + ":" + rightCells.length)
            },
        }
    }
}).catch(function (err) {
    console.error("Error on cell relate : ")
    console.log(err.stack)
});