// controller.js
//
// orchestrates the grid movements and selector placement
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    imageEffects    : '../image/imageEffects.js',
    math            : '../math.js'
}).then(function importsAreReady(imports) {

    module.exports = function(scene) {

        return {
            container   : null,
            scrollX     : 0,
            scrollY     : 0,
            currentCell : null,
            // get the cell above the currently selected cell
            // if a parameter is passed in - it determines the cell above the passed in param
            _getTopCell : function(cell) {
                if (cell == null)
                    return this.currentCell.config.topCell
                else 
                    return cell.config.topCell
            },
            getCurrentProgramViewPortY : function(){
                console.log("-----Parent ------" + this.currentCell.container.parent.parent)
                return this.currentCell.container.parent.y + this.currentCell.container.y - (-1 * this.currentCell.container.parent.parent.y)
            },
            // determines if the currently selected cell is in a bottom row of the view port
            _currentCellIsAtBottomRow : function() {
                var y = this.getCurrentProgramViewPortY() + this.tileH *1.5
                return y > this.container.h
            },
            // determines if the currently selected cell is in a top row of the view port
            _currentCellIsAtTopRow : function() {
                console.log('----top')
                var y = this.getCurrentProgramViewPortY() - this.tileH *0.5
                return y < 0
            },
            // determines if the currently selected cell is at the right-most part of the screen
            _currentCellIsAtRightColumn : function() {
                return this.currentCell.config.rightColumn
            },
            // determines if the currently selected cell is at the left-most part of the screen
            _currentCellIsAtLeftColumn : function() {
                return this.currentCell.config.leftColumn
            },
            loadNeighbor : null,
            registerLoadNeigborFunction : function(func) {
                this.loadNeighbor = func
                return this
            },
            // registers various components with this controller, and also establishes what to do when keys are pressed
            register : function(container,containerGrid,uiGridSelector,uiScrollingList,uiGrid,currentCell,scrollingListWidth,
                                tileH,borderWidth,currentRow) {        // initialize the container with the key pressed hooks
                
                var scrollY = 0
                var scrollX = 0

                this.tileH = tileH

                var t = this

                t.container = container
                t.currentCell = currentCell
                t.currentRow = currentRow

                container.focus = true

                // highlight the current cell and move selector to current cell
                currentCell.title.textColor = 0x1E90FFff
                uiGridSelector
                    .init(tileH,container)
                    .render(currentCell,scrollingListWidth)

                container.on("onKeyDown", function(e){

                    var pageScroll = null,
                        targetCell = null

                    // following if/else structure has logic to determine what kind of page scroll should be done
                    // along with determining the target cell (if any)
                    if (e.keyCode == 37)                        // LEFT ARROW
                        targetCell = t.currentCell.config.prevCell
                        if (targetCell != null && t._currentCellIsAtLeftColumn()) {     // we are at the left most bound of this sector
                            pageScroll = 'left'                 // lets scroll right
                        }
                    else if (e.keyCode == 39) {                 // RIGHT ARROW
                        targetCell = t.currentCell.config.nextCell
                        if (targetCell != null && t._currentCellIsAtRightColumn()) {    // we are at the right most bound of this sector
                            pageScroll = 'right'                // lets scroll right
                        }
                    } else if (e.keyCode == 38) {               // TOP ARROW
                        targetCell = t._getTopCell()
                        t.currentRow--
                        if (t._currentCellIsAtTopRow()) // && t.getTopCell(targetCell)) // we are the the top-most
                            pageScroll = 'down'
                    } else if (e.keyCode == 40) {               // DOWN ARROW
                        targetCell = t.currentCell.config.bottomCell
                        t.currentRow++
                        if (t._currentCellIsAtBottomRow())
                            pageScroll = 'up'                        
                    } else if (e.keyCode == 33) {               // PAGE UP
                        targetCell = null
                        t.currentRow += 5
                    } else if (e.keyCode == 44) {               // PAGE DOWN
                        targetCell = null
                        t.currentRow -= 5
                    }

                    var uiScrollingListYOffset = 0

                    if (targetCell != null) {
                        // console.log("sector ---" +uiGrid.sectors.currentSector.right)
                        var prevCell = t.currentCell    // record the previous cell

                        t.currentCell.title.textColor = 0xffffffff                  // change prev program title to grey
                        t.currentCell = targetCell                                  // remember current program
                        targetCell.title.textColor = 0x1E90FFff                     // change current program title to blue

                        var loadNeighborDirection = null

                        if ((prevCell.config.rightColumn && prevCell.config.leftColumn) ||
                            (targetCell.config.rightColumn && targetCell.config.leftColumn)){

                            // special logic if dealing with single cell row

                            if (prevCell.config.bottomRow && targetCell.config.topRow) {            // we've crossed into the sector below
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.bottom
                                uiScrollingList.currentSector = uiScrollingList.currentSector.bottom
                                if (uiGrid.sectors.currentSector.bottom == null)
                                    loadNeighborDirection = 'bottom'
                            } else if (prevCell.config.topRow && targetCell.config.bottomRow) {     // we've crossed into the sector above
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.top
                                uiScrollingList.currentSector = uiScrollingList.currentSector.top
                                if (uiGrid.sectors.currentSector.top == null)
                                    loadNeighborDirection = 'top'
                            } else if (prevCell.config.leftColumn && pageScroll == 'left') {        // we've crossed into the left sector
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.left
                            } else if (prevCell.config.rightColumn && pageScroll == 'right') {      // we've crossed into the right sector
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.right
                                loadNeighborDirection = 'right'
                            }

                        } else {
                            if (prevCell.config.bottomRow && targetCell.config.topRow) {            // we've crossed into the sector below
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.bottom
                                uiScrollingList.currentSector = uiScrollingList.currentSector.bottom
                                if (uiGrid.sectors.currentSector.bottom == null)
                                    loadNeighborDirection = 'bottom'
                            } else if (prevCell.config.topRow && targetCell.config.bottomRow) {     // we've crossed into the sector above
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.top
                                uiScrollingList.currentSector = uiScrollingList.currentSector.top

                                if (uiGrid.sectors.currentSector.top == null)
                                    loadNeighborDirection = 'top'
                            } else if (prevCell.config.leftColumn && targetCell.config.rightColumn) { // we've crossed into the left sector
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.left
                            } else if (prevCell.config.rightColumn && targetCell.config.leftColumn) { // we've crossed into the right sector
                                uiGrid.sectors.currentSector = uiGrid.sectors.currentSector.right
                                loadNeighborDirection = 'right'
                            }
                        }

                        // TODO - Destroy old sectors - come up with strategy

                        if (loadNeighborDirection != null) {
                            t.loadNeighbor(t.currentRow, loadNeighborDirection, function (topData,bottomData,rightData) {
                                if (loadNeighborDirection == "top") {
                                    uiGrid.addTopSector(topData)
                                    uiGrid.addRightSector(rightData)
                                    uiScrollingList.addTopSector()
                                } else if (loadNeighborDirection == "bottom") {
                                    uiGrid.addBottomSector(bottomData)
                                    uiGrid.addRightSector(rightData)
                                    uiScrollingList.addBottomSector()
                                } else if (loadNeighborDirection == "right") {
                                    uiGrid.addRightSector(rightData)
                                    uiGrid.addTopSector(topData)
                                    uiGrid.addBottomSector(bottomData)
                                }
                            })
                        }

                        if (pageScroll != null) {

                            // TODO - test page up and down
                            // the following logic tracks the current row, and establishes how much to scroll along X and Y
                            if (pageScroll == 'down') {
                                uiScrollingListYOffset = tileH
                                scrollY += (tileH )                        // move the page one tile down
                            } else if (pageScroll == 'up') {
                                uiScrollingListYOffset = -1 * (tileH )
                                scrollY -= (tileH )                        // move the page one tile up
                            } else if (pageScroll == 'pagedown') {
                                scrollY = scrollY - container.h           // move the page one whole page down
                            } else if (pageScroll == 'pageup') {
                                scrollY = -1 * (scrollY + container.h )   // move the page one whole page up
                            } else if (pageScroll == 'right') {
                                scrollX = scrollX - containerGrid.w                     // scroll the grid one whole container width right
                            } else if (pageScroll == 'left') {
                                scrollX = scrollX + containerGrid.w                     // scroll the grid one whole container width right
                            }

                            var gridAnimateConfig
                            if (pageScroll == 'right' || pageScroll == 'left') {        // left /right scroll does not require the channel list to move
                                gridAnimateConfig = {x: scrollX}
                            } else if (pageScroll == 'up' || pageScroll == 'down') {
                                uiScrollingList.update(uiScrollingListYOffset)
                                gridAnimateConfig = {y: scrollY}
                            }

                            //TODO - perhaps this should be behavior that gets passed in via the sample, since it is tile specific

                            uiGridSelector.update(targetCell, scrollingListWidth)

                            if (gridAnimateConfig != null) {

                                var animationSpeed = 0.50

                                containerGrid.animateTo(gridAnimateConfig, animationSpeed, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
                                    .then(function (obj) {
                                        if (targetCell != null && pageScroll != 'left' && pageScroll != 'right') {
                                            uiGridSelector.update(targetCell, scrollingListWidth, t.getCurrentProgramViewPortY())    // move the selector
                                        }
                                    })
                            }

                            if (pageScroll == 'left' || pageScroll == 'right')
                                uiGridSelector.update(targetCell, scrollingListWidth)

                        } else {
                            // TODO - add logic here to pan the guide left / right / up / down
                            uiGridSelector.update(targetCell,scrollingListWidth,t.getCurrentProgramViewPortY())     // move the selector
                        }
                    }
                })
            }
        }
    }

}).catch( function(err){
    console.error("Error on Controller : ")
    console.log(err)
});
