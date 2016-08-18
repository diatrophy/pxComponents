module.exports = function () {

    var borderWidth = 1

    var calculateCellWidthWithMin = function (min, minWidth) {

        var wid
        if (min != null)
            wid = min * minWidth
        return wid
    }

    return {
        DEFAULT_BUCKET_SIZE: 2,
        // yOffset - position of the row (along the y axis)
        // minWidth - width of each minute
        // cellFunction - function that creates the cell, function param allows easy testability as tests can
        // supply own function that can collect data - to be asserted later
        convertRowOfListingsToCells: function (row, tileH, container, sectorWidth, yOffset, cellFunction, minWidth) {

            var xOffset = 0,
                cells = []

            // loop through all the cells in the row
            row.forEach(function (cellData) {

                var wid = calculateCellWidthWithMin(cellData.min, minWidth)

                if (cellData.oMin != null && cellData.oMin != 0) {
                    xOffset = cellData.oMin * minWidth
                }

                var alpha = 1
                if (cellData.placeholder) {
                    alpha = 0
                }

                // keep track of all the cells in a single array
                cells.push(cellFunction(container, alpha, xOffset, yOffset, wid, tileH, cellData))

                xOffset += wid              // onto the next cell in the row
            })

            return cells
        },
        // takes an matrix of listings (an array for each channel) and converts this to a single array of cells
        convertListingDataInViewToCells: function (listingDataInView, container, width, tileHeight, cellFunction) {

            var cells = [],                 // array to return
                tileH = tileHeight,         // for use in an inner function
                yOffset = borderWidth,      // starting offset along the y-axis
                t = this

            var minWidth =container.w / ((2 * 60) + 45)

            // use 2 nested loops to go through the matrix of listings and generate cells
            listingDataInView.forEach(function (row) {

                if (row.length == 0) {
                    // push a single placeholder cell denoting the empty row. The reason for this is to support
                    // proximity matching and side stitching of cells
                    row.push({p: 100, placeholder: true})
                }

                var rowCells = t.convertRowOfListingsToCells(row, tileHeight, container, width, yOffset, cellFunction, minWidth)
                cells = cells.concat(rowCells)

                yOffset += tileH   // onto the next row
            })

            return cells
        },
        calculateCellWidth: function (cell, xOffset) {

            if (xOffset != null) {
                if (cell.container.x < xOffset) {
                    var xLoc = cell.container.x
                    if (xLoc == null)
                        xLoc = 0
                    return cell.container.w - (xOffset - xLoc)
                }
            }

            return cell.container.w
        },
        // method to determine how many buckets are in a percentage range
        // Example - if the bucket size is 5, 5% = 1 bucket
        calculateNumberOfCellBuckets: function (percentage, offset) {

            var buckets = 1        // default to 1 bucket

            if (offset != null && offset < 0)
                percentage += offset

            if (percentage != null)
                buckets = Math.round(percentage / this.DEFAULT_BUCKET_SIZE)
            return buckets
        },
    }
}