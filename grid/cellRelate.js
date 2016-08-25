// cellRelate.js
//
// Logic to relate cells within a grid to each other
//
// Jason Coelho

px.import({
    math: '../math.js',
    gridHelper: 'gridHelper.js',
    logger: '../logger.js'
}).then(function importsAreReady(imports) {

    var gridHelper = imports.gridHelper(),
        logger = imports.logger(),
        DEFAULT_BUCKET_SIZE = gridHelper.DEFAULT_BUCKET_SIZE

    module.exports = function () {

        return {
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

                var rowCount = 0
                var cellCount = 0
                var prevRowTrackerMap = null

                listingDataInView.forEach(function (row) {               // 1st loop - channels

                    var prevCell = null

                    var currentRowTrackerMap = {}
                    var currentCellTrack = DEFAULT_BUCKET_SIZE          // starting bucket number

                    var columnCount = 0

                    if (row.length == 0) {
                        row.push({}) // push a dummy val so that the following loop executes
                    }

                    // loops through all the listings per channel.
                    row.forEach(function (cellData) {                     // 2nd loop - channel listings

                        // logic for setting the prev and next cell
                        var currentCell = cells[cellCount]

                        // determine left/right columns, in some cases left == right (because single cell rows)
                        if (columnCount == 0)
                            currentCell.config.leftColumn = true
                        if (columnCount == row.length - 1)
                            currentCell.config.rightColumn = true

                        // the easy part - linking the previous cell to the next and vice-versa
                        currentCell.config.prevCell = prevCell          // track the cell to the left (previous)
                        if (prevCell != null)
                            prevCell.config.nextCell = currentCell      // track the cell to the right (next)
                        prevCell = currentCell

                        var firstCellBucket = currentCellTrack

                        // determine how many buckets to assign the current cell, and then create a reverse
                        // lookup map for each bucket. buckets are numbered by DEFAULT_BUCKET_SIZE increments
                        // Cells can span across a sector(s), hence buckets max out at 100
                        // TODO - need to handle offset
                        var currentCellBuckets = gridHelper.calculateNumberOfCellBuckets(currentCell.config.data.p, currentCell.config.data.o)
                        for (var i = 0; i < currentCellBuckets; i++) {
                            if (currentCellTrack < 100) {
                                currentRowTrackerMap[currentCellTrack] = currentCell
                                currentCellTrack += DEFAULT_BUCKET_SIZE
                            }
                        }

                        // logic for setting the above and below cell. top/bottom cells are not complementary
                        // as indicated by the diagram in the header documentation

                        if (prevRowTrackerMap == null) {                // if there is no previous lookup then
                            currentCell.config.topRow = true            // mark this as a top row in this sector
                        } else {

                            // match the current's cell 'first' cell bucket to the cell in the previous row via
                            // the lookup map - the matched cell is the top cell
                            currentCell.config.topCell = prevRowTrackerMap[firstCellBucket]

                            // Loop through the previous row for bucket numbers corresponding to the current cell's
                            // bucket numbers - the first match is the bottom cell.
                            for (var k = firstCellBucket; k < currentCellTrack;) {
                                if (prevRowTrackerMap[k] != null) {
                                    if (prevRowTrackerMap[k].config != null && prevRowTrackerMap[k].config.bottomCell == null)
                                        prevRowTrackerMap[k].config.bottomCell = currentCell
                                }
                                k += DEFAULT_BUCKET_SIZE
                            }
                        }

                        if (rowCount == listingDataInView.length - 1)
                            currentCell.config.bottomRow = true         // mark this as a bottom row in this sector

                        cellCount++
                        columnCount++
                    })

                    prevRowTrackerMap = currentRowTrackerMap

                    rowCount++
                })
            },
            _proximitySearchTopBottom: function (cells, listingDataInView) {

                var cellCount = 0
                var prevRowTrackerMap = null

                listingDataInView.forEach(function (row) {

                    var currentRowTrackerMap = {}
                    var currentCellTrack = DEFAULT_BUCKET_SIZE

                    if (row.length == 0) {
                        row.push({}) // push a dummy val so that the following loop executes
                    }

                    row.forEach(function (cellData) {

                        // logic for setting the prev and next cell
                        var currentCell = cells[cellCount]
                        var currentCellBuckets = gridHelper.calculateNumberOfCellBuckets(currentCell.config.data.p, currentCell.config.data.o)
                        var nT = currentCellTrack
                        for (var i = 0; i < currentCellBuckets; i++) {
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
                    topRow = this._getTopRow(bottomCells)

                // create a new data set containing the bottom row of the top sector, and the top row of the bottom sector
                var data = [topData[topData.length - 1], bottomData[0]]

                this._proximitySearchTopBottom(bottomRow.concat(topRow), data)
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
                    if (cell.config.prev != null)
                        cell.config.prev.config.next = null     // first de-reference the prev cell from pointing to this cell
                    cell.config.prev = null                     // then remove the reference to the prev cell
                })
            },
            // de-reference the cells on the right side
            rightUnStitchSector: function (cells) {

                var rightColumn = this._getRightColumn(cells)
                rightColumn.forEach(function (cell) {
                    if (cell.config.next != null)
                        cell.config.next.config.prev = null     // first de-reference the next cell from pointing to this cell
                    cell.config.next = null                     // then remove the reference to the next cell
                })
            },
            // takes 2 sectors and creates relationships between the prev and next columns of the containers next to each other
            sideStitchSectors: function (leftCells, rightCells) {

                var leftCellsRightColumn = this._getRightColumn(leftCells)
                var rightCellsLeftColumn = this._getLeftColumn(rightCells)

                if (rightCellsLeftColumn.length == leftCellsRightColumn.length) {

                    // loop through the left column and create relation to the right column
                    leftCellsRightColumn.forEach(function(cell,i){
                        cell.config.nextCell = rightCellsLeftColumn[i]
                        rightCellsLeftColumn[i].config.prevCell = cell
                    })
                } else {
                    console.log('mismatched columns - ' + leftCellsRightColumn.length + "----" + rightCellsLeftColumn.length + " --- " + "original lengths - " +
                        leftCells.length + ":" + rightCells.length)
                }
            },
        }
    }
}).catch(function (err) {
    console.error("Error on cell relate : ")
    console.log(err.stack)
});