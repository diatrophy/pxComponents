// controller.js
//
// orchestrates the grid movements and selector placement
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    imageEffects    : '../image/imageEffects.js',
    math            : '../math.js',
    logger          : '../logger.js'
}).then(function importsAreReady(imports) {

    var animationSpeed = 0.50,
        logger = imports.logger()

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
            getCellViewPortY : function(cell){
                return cell.container.parent.y + cell.container.y - (-1 * cell.container.parent.parent.y)
            },
            getCellViewPortX : function(cell){
                var containerX = cell.container.parent.parent.x
                return cell.container.parent.x + cell.container.x - (-1 * containerX)
            },
            // determines if the currently selected cell is in a bottom row of the view port
            _cellIsAtBottomRow : function(cell) {
                var y = this.getCellViewPortY(cell) + this.tileH *1.5
                return y > this.container.h
            },
            // determines if the currently selected cell is in a top row of the view port
            _cellIsAtTopRow : function(cell) {
                var y = this.getCellViewPortY(cell) - this.tileH *0.5
                return y < 0
            },
            // determines if the currently selected cell is at the left-most part of the screen
            _cellIsAtLeftColumn : function(cell) {
                return cell.config.leftColumn
            },
            loadNeighbor : null,
            rightScrollOffset: function(targetCell,timeWidth,containerWidth, targetContainerWidth, callback){

                var pageScroll , xOffset = 0

                if (targetCell != null) {

                    // get the position of the target cell and determine if it is partially obscured at the right
                    // side or it resides outside the screen
                    var x = this.getCellViewPortX(targetCell)
                    if (x >= containerWidth || ((x < containerWidth) && (x + targetContainerWidth > containerWidth))) {

                        pageScroll = 'right'

                        // if (targetCell.config.nextCell != null) {
                        //
                        //     // if there is a cell to the right of this cell, then offset along the x-axis so that
                        //     // it comes into view and the time-line is also offset consistently. The 2 multiplier
                        //     // is so that the grid scrolls in half hour increments as timeWidth = 15 minutes
                        //     var d = Math.abs((x + targetContainerWidth - containerWidth) / timeWidth)// + 0.25
                        //
                        //     // var d = 1
                        //     xOffset = -1 * d * (timeWidth*2)
                        // } else {

                            // otherwise bring the cell into view so that there is no gap at the end
                            xOffset = -1 * Math.abs(x + targetContainerWidth - containerWidth)
                        // }
                    }

                    callback(pageScroll,xOffset)
                }
            },
            leftScrollOffset: function(targetCell,timeWidth, callback){

                var pageScroll , xOffset = 0

                if (targetCell != null) {

                    // get the position of the target cell and determine if it is at the left most part of the
                    // screen or if it is partially obscured by the scrolling list
                    var x = this.getCellViewPortX(targetCell)
                    if (x < 0) {

                        pageScroll = 'left'

                        if (targetCell.config.prevCell != null) {

                            // if there is a cell to the left of the target cell, then offset along the
                            // x-axis so that it comes into view AND the time-line is offset consistently
                            xOffset = ( Math.abs((x) / timeWidth) ) * (timeWidth*2)
                        } else {

                            // otherwise bring the cell into view at the beginning of the grid
                            xOffset = -1 * x
                        }
                    }
                    callback(pageScroll,xOffset)
                }
            },
            registerLoadNeigborFunction : function(func) {

                // method signature -
                // function(currentRow,direction,callback)
                // currentRow - index of the current row, determined how many channels up and down to fetch
                // direction - of the load
                // callback - function with a input of a map containing the sector data to load

                this.loadNeighbor = func
                return this
            },
            // following if/else structure has logic to determine what kind of page scroll should be done
            // along with determining the target cell (if any)
            keyCodeAction : function(e,currentCell,timeWidth,callback) {

                var targetCell, pageScroll, yOffset = 0, uiScrollingListYOffset = 0

                // sometimes, when the arrow is pressed down, pxscene can cause a speed-scroll, and it
                // possible that the target cell is currently loading asynchronously, hence the need to check if the
                // target cell is null before invoking any function that may result in an 'undefined' exception

                if (e.keyCode == 37) {                              // LEFT ARROW

                    targetCell = currentCell.config.prevCell

                    if (targetCell != null) {
                        this.leftScrollOffset(targetCell, timeWidth, function (scroll, offsetX) {
                            callback(targetCell, null, scroll, offsetX, 0, 0)
                        })
                    }

                } else if (e.keyCode == 39) {                       // RIGHT ARROW

                    targetCell = currentCell.config.nextCell

                    this.rightScrollOffset(targetCell, timeWidth, this.container.w, targetCell.container.w ,
                        function (scroll,offsetX) {
                            callback(targetCell, null, scroll, offsetX, 0, 0)
                        })

                } else if (e.keyCode == 38) {                       // TOP ARROW

                    targetCell = this._getTopCell()

                    if (targetCell != null && targetCell.loaded) {

                        this.currentRow--
                        if (this._cellIsAtTopRow(currentCell)) {    // we are the the top-most
                            pageScroll = 'down'
                            uiScrollingListYOffset = this.tileH
                            yOffset = this.tileH                    // move the page one tile down
                        }

                        var t = this

                        // if the cell above is wider than the container, do not attempt diagonal move
                        if (t.getCellViewPortX(targetCell) <= 0 && targetCell.container.w >= this.containerGrid.w) {
                            callback(targetCell, pageScroll, null, 0, yOffset, uiScrollingListYOffset)
                        } else
                            // check if diagonal move
                            t.rightScrollOffset(targetCell, timeWidth, t.container.w, targetCell.container.w , function (horizontalScroll, offsetX) {

                                if (horizontalScroll == null) {
                                    t.leftScrollOffset(targetCell, timeWidth, function (horizontalScroll, offsetX) {

                                        callback(targetCell, pageScroll, horizontalScroll, offsetX, yOffset, uiScrollingListYOffset)
                                    })
                                } else
                                    callback(targetCell, pageScroll, horizontalScroll, offsetX, yOffset, uiScrollingListYOffset)
                            })
                    }

                } else if (e.keyCode == 40) {                       // DOWN ARROW

                    targetCell = currentCell.config.bottomCell

                    if (targetCell != null) {

                        this.currentRow++

                        // determine if the target cell is at the bottom of the screen, and in which case
                        // scroll the entire page up by one tile height

                        if (this._cellIsAtBottomRow(currentCell)) {
                            pageScroll = 'up'
                            uiScrollingListYOffset = -1 * (this.tileH)
                            yOffset = -1 * (this.tileH)
                        }

                        var t = this

                        // if the cell below is wider than the container, do not attempt diagonal move
                        if (t.getCellViewPortX(targetCell) <= 0 && targetCell.container.w >= this.containerGrid.w) {
                            callback(targetCell, pageScroll, null, 0, yOffset, uiScrollingListYOffset)
                        } else
                        // check if diagonal move
                            t.rightScrollOffset(targetCell, timeWidth, t.container.w, targetCell.container.w , function (horizontalScroll, offsetX) {
                                if (horizontalScroll == null)
                                    t.leftScrollOffset(targetCell, timeWidth, function (horizontalScroll, offsetX) {
                                        callback(targetCell, pageScroll, horizontalScroll, offsetX, yOffset, uiScrollingListYOffset)
                                    })
                                else
                                    callback(targetCell, pageScroll, horizontalScroll, offsetX, yOffset, uiScrollingListYOffset)
                            })
                    }
                } else if (e.keyCode == 33) {                   // PAGE UP
                    targetCell = null
                    this.currentRow += 5
                } else if (e.keyCode == 44) {                   // PAGE DOWN
                    targetCell = null
                    this.currentRow -= 5
                }
            },
            // determines if the sector has changed, and if it has invokes the sectorChanged callback
            // additionally if the data in the next sector (of motion ex. top of next if movement is up arrow)
            // is empty then the second callback is invoked - that triggers fetching off and loading data
            sectorChange : function(currentSector,currentScrollingSector,currentTimeSector,
                                    prevCell,targetCell,sectorChangeCallback,loadDataCallback) {

                var nextSector, nextScrollingSector, nextTimeSector, loadNeighborDirection,
                    previous = prevCell.config,
                    target = targetCell.config,
                    previousContainerId = prevCell.container.parent.id,
                    targetContainerId = targetCell.container.parent.id

                if (previousContainerId != targetContainerId) {

                    if (previous.bottomRow && target.topRow) {            // we've crossed into the sector below

                        nextSector = currentSector.bottom
                        nextScrollingSector = currentScrollingSector.bottom
                        if (nextSector.bottom == null)
                            loadNeighborDirection = 'bottom'

                    } else if (previous.topRow && target.bottomRow) {     // we've crossed into the sector above

                        nextSector = currentSector.top
                        nextScrollingSector = currentScrollingSector.top
                        if (nextSector.top == null)
                            loadNeighborDirection = 'top'

                    } else if (previous.leftColumn && target.rightColumn) { // we've crossed into the left sector

                        nextSector = currentSector.left
                        nextTimeSector = currentTimeSector.left
                        if (nextSector.left == null)
                            loadNeighborDirection = 'left'

                    } else if (previous.rightColumn && target.leftColumn) { // we've crossed into the right sector

                        nextSector = currentSector.right
                        nextTimeSector = currentTimeSector.right
                        if (nextSector.right == null)
                            loadNeighborDirection = 'right'
                    }

                    if (nextSector != null) { // only invoke the callback if the sector has changed

                        sectorChangeCallback(nextSector, nextScrollingSector, nextTimeSector)
                        if (loadNeighborDirection != null)
                            loadDataCallback(loadNeighborDirection, nextSector, nextScrollingSector, nextTimeSector)
                    }
                }
            },
            // this function handles the actions to undertake if the sector has changed
            determineSectorChangeAndLoadNeighboringData : function(cSector,currentScrollingSector,currentTimeSector,
                                             prevCell,targetCell,pageScroll,horizontalScroll,uiGrid,uiScrollingList,uiGridTime){
                var t = this

                // callback function indicating that the sector has changed and this warrants
                // drawing of cells and time line (off-screen)
                var sectorChangeActionCallback = function(nextSector,nextScrollingSector,nextTimeSector) {

                    // TODO - Destroy old sectors - come up with strategy
                    uiGrid.sectors.currentSector = nextSector

                    if (nextScrollingSector != null)
                        uiScrollingList.currentSector = nextScrollingSector
                    if (nextTimeSector != null)
                        uiGridTime.currentSector = nextTimeSector
                }

                // callback function indicating that the sector has changed and it warrants neighbor load
                var loadActionCallback = function(loadNeighborDirection,nextSector,nextScrollingSector,nextTimeSector) {

                    // add the right time sector ahead of the function call
                    // so that we know the time for data retrieval
                    if (loadNeighborDirection == "right")
                        uiGridTime.addRightSector()

                    // INVOKE THE REGISTERED LOAD DATA FUNCTION
                    // LOGIC to load data if we have crossed into a different sector
                    // only need to load data if the callback determines it is needed

                    t.loadNeighbor(t.currentRow, loadNeighborDirection, function (data) {

                        if (loadNeighborDirection == "top") {
                            console.log(data.top)
                            var topSector = uiGrid.addTopSector(data.top, nextSector)
                            nextSector.top = topSector
                            topSector.bottom = nextSector
                            uiGrid.addTopRightSector(data.topRight, nextSector)
                            uiScrollingList.addTopSector(nextScrollingSector)
                        } else if (loadNeighborDirection == "bottom") {
                            uiGrid.addBottomSector(data.bottom, nextSector)
                            uiGrid.addRightSector(data.bottomRight, nextSector)
                            uiScrollingList.addBottomSector(nextScrollingSector)
                        } else if (loadNeighborDirection == "right") {
                            uiGrid.addRightSector(data.right, nextSector)
                            uiGrid.addTopRightSector(data.topRight, nextSector)
                            uiGrid.addBottomRightSector(data.bottomRight)
                        }
                    })
                }

                this.sectorChange(cSector,currentScrollingSector,currentTimeSector,
                    prevCell,targetCell,
                    sectorChangeActionCallback,
                    loadActionCallback)
            },
            handleTimeBarAnimate : function(timeAnimateConfig) {

                if (timeAnimateConfig != null) {
                    this.uiGridTime.timeContainer
                        .animateTo(timeAnimateConfig, animationSpeed,
                            scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
                        .then(function (obj) {
                            // TODO update the highlight on the timebar
                        })
                }
            },
            handleGridAnimate : function(gridAnimateConfig,targetCell,horizontalScroll,gridSelectorXOffset) {

                var t = this
                if (gridAnimateConfig != null) {

                    t.containerGrid.animateTo(gridAnimateConfig, animationSpeed, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
                        .then(function (obj) {

                            if (targetCell != null && horizontalScroll != 'left' && horizontalScroll != 'right') {

                                // continuation of the move animation above - to give the appearance of smooth motion
                                // also a way to ensure that the selector does not overshoot
                                t.uiGridSelector.update(targetCell, gridSelectorXOffset, t.getCellViewPortY(targetCell))    // move the selector
                            }
                        })
                }
            },
            // registers various components with this controller, and also establishes what to do when keys are pressed
            register : function(container,containerGrid,uiGridSelector,uiScrollingList,uiGrid,uiGridTime,currentCell,scrollingListWidth,
                                tileH,borderWidth,currentRow) {        // initialize the container with the key pressed hooks

                var scrollY = 0
                var scrollX = 0

                this.tileH = tileH

                var t = this

                t.container = container
                t.containerGrid = containerGrid
                t.currentCell = currentCell
                t.currentRow = currentRow
                t.uiGridTime = uiGridTime
                t.uiGridSelector = uiGridSelector

                container.focus = true

                // move selector to current cell
                uiGridSelector
                    .init(tileH,container,scrollingListWidth)
                    .render(currentCell)

                container.on("onKeyDown", function(e){

                    var currentCell = t.currentCell,
                        currentSector = uiGrid.sectors.currentSector,
                        currentScrollingSector = uiScrollingList.currentSector,
                        currentTimeSector = uiGridTime.currentSector

                    t.keyCodeAction(e,currentCell,uiGridTime.timeSectorWidth,
                        function(targetCell,pageScroll,horizontalScroll, xOffset,yOffset,uiScrollingListYOffset){

                        if (targetCell.loaded != true)
                            return                                                  // short circuit if contents of cell not loaded

                        t.currentCell = targetCell                                  // remember current program

                        var prevCell = currentCell                                  // record the previous cell

                        uiGrid.tileSelected(targetCell,prevCell)                    // highlights the next cell

                        t.determineSectorChangeAndLoadNeighboringData(currentSector,currentScrollingSector,currentTimeSector,
                            prevCell,targetCell,pageScroll,horizontalScroll,uiGrid,uiScrollingList,uiGridTime)

                        if (yOffset != null || yOffset != 0 || xOffset != null || xOffset != 0) {
                            scrollX += xOffset      // update the x and y scroll positions based on the offsets
                            scrollY += yOffset

                            if (scrollX > 0)        // if the scroll along the x-axis is 'drifting'
                                scrollX = 0         // set to zero. TODO - figure out why there is a drift

                            // set up the animation parameters based on the scrolling direction
                            var gridAnimateConfig, timeAnimateConfig
                            if (horizontalScroll == 'right' || horizontalScroll == 'left') {
                                // left /right scroll does not require the channel list to move
                                timeAnimateConfig = gridAnimateConfig = {x: scrollX}
                            }

                            if (pageScroll == 'up' || pageScroll == 'down') {
                                // top / down does not require the time-line to move
                                uiScrollingList.update(uiScrollingListYOffset)
                                gridAnimateConfig = {y: scrollY}
                            }

                            // the selector's x-offset is dependent on the cell's location in the view-port
                            // unless it will be hidden by the scrolling list
                            var gridSelectorXLoc = scrollingListWidth + t.getCellViewPortX(targetCell) + xOffset

                            if (gridSelectorXLoc < scrollingListWidth) {
                                gridSelectorXLoc = scrollingListWidth
                            }

                            // start moving the selector towards the target cell. we do this so that the motion is
                            // smooth and does not appear as a post-action to the grid moving during a page scroll
                            var y = t.getCellViewPortY(targetCell) + yOffset
                            // var y = yOffset

                            uiGridSelector.update(targetCell,gridSelectorXLoc,y)

                            var p = t.handleGridAnimate(gridAnimateConfig,targetCell,horizontalScroll,gridSelectorXLoc)
                            t.handleTimeBarAnimate(timeAnimateConfig)

                        } else {
                            var y = t.getCellViewPortY(targetCell)
                            // TODO - add logic here to pan the guide left / right / up / down
                            // move the selector
                            uiGridSelector.update(targetCell, xOffset + t.getCellViewPortX(targetCell) + scrollingListWidth, t.getCellViewPortY(targetCell))
                        }
                    })
                })
            }
        }
    }

}).catch( function(err){
    console.error("Error on Controller : ")
    console.log(err)
});
