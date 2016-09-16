// listController.js
//
// orchestrates the list movements and selector placement
//
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    imageEffects: '../image/imageEffects.js',
    math: '../math.js',
    logger: '../logger.js'
}).then(function importsAreReady(imports) {

    var animationSpeed = 0.50,
        logger = imports.logger()

    module.exports = function (scene) {

        return {
            getCellViewPortY: function (cell) {
                return cell.container.parent.y + cell.container.y - (-1 * cell.container.parent.parent.y)
            },
             // determines if the currently selected cell is in a top row of the view port
            _cellIsAtTopRow: function (cell) {
                var y = this.getCellViewPortY(cell) - this.tileH * 0.5
                return y < 0
            },
            // determines if the currently selected cell is in a bottom row of the view port
            _cellIsAtBottomRow: function (cell) {
                var y = this.getCellViewPortY(cell) + this.tileH * 1.5
                return y > this.containerGrid.h
            },
            register: function (scrollingList, uiGridSelector, tileH, containerGrid, currentCell) {

                this.tileH = tileH
                this.currentCell = currentCell
                this.containerGrid = containerGrid
                
                var t = this
                scrollingList.container.parent.focus = true

                scrollingList.container.parent.on("onKeyDown", function (e) {

                    if (e.keyCode == 38) {                       // TOP ARROW

                        var nextCell = t.currentCell.config.prevCell

                        if (nextCell != null) {

                            // determine if the target cell is at the bottom of the screen, and in which case
                            // scroll the entire page up by one tile height

                            // if (t._cellIsAtTopRow(t.currentCell)) {

                            //     var yOffset = t.tileH
                            //     scrollingList.update(yOffset)
                            // } else {

                            // }

                            uiGridSelector.update(nextCell)

                            t.currentCell = nextCell

                        }

                    } else if (e.keyCode == 40) {                // DOWN ARROW

                        var nextCell = t.currentCell.config.nextCell
                        
                        if (nextCell != null) {

console.log('------' + nextCell)
                            // determine if the target cell is at the bottom of the screen, and in which case
                            // scroll the entire page up by one tile height

                            if (t._cellIsAtBottomRow(t.currentCell)) {

                                var yOffset = -1 * (t.tileH)
                                scrollingList.update(yOffset)
                                // uiGridSelector.update(t.currentCell)

                            } else {
                                uiGridSelector.update(nextCell)
                            }

                            t.currentCell = nextCell

                        }
                    }
                })

                // move selector to current cell
                uiGridSelector
                    .init(tileH, containerGrid)
                    .render(currentCell)
            }
        }
    }

}).catch(function (err) {
    console.error("Error on List Controller : ")
    console.log(err.stack)
});
