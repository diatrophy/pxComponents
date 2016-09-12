// controller.js
//
// orchestrates the grid movements and selector placement
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
            container: null,
            scrollX: 0,
            scrollY: 0,
            currentCell: null,
            currentViewRow: 0,
            // get the cell above the currently selected cell
            // if a parameter is passed in - it determines the cell above the passed in param
            _getTopCell: function (cell) {
                if (cell == null)
                    return this.currentCell.config.topCell
                else
                    return cell.config.topCell
            },
            getCellViewPortY: function (cell) {
                return cell.container.parent.y + cell.container.y - (-1 * cell.container.parent.parent.y)
            },
            getCellViewPortX: function (cell) {
                var containerX = cell.container.parent.parent.x
                return cell.container.parent.x + cell.container.x - (-1 * containerX)
            },
            getCellViewPortXWithRespectToX: function (cell, containerGridXPos) {
                return cell.container.parent.x + cell.container.x - Math.abs(containerGridXPos)
            },
            // determines if the currently selected cell is in a bottom row of the view port
            _cellIsAtBottomRow: function (cell) {
                var y = this.getCellViewPortY(cell) + this.tileH * 1.5
                return y > this.containerGrid.h
            },
            // determines if the currently selected cell is in a top row of the view port
            _cellIsAtTopRow: function (cell) {
                var y = this.getCellViewPortY(cell) - this.tileH * 0.5
                return y < 0
            },
            // determines if the currently selected cell is at the left-most part of the screen
            _cellIsAtLeftColumn: function (cell) {
                return cell.config.leftColumn
            },
            loadNeighbor: null,
            // given a targetCell and container width, this function will determine how much to scroll and 
            // invoke the callback function
            _rightScrollOffset: function (targetCell, timeWidth, callback,getCellViewPortX,containerWidth) {

                if (targetCell != null) {

                    var pageScroll, xOffset = 0,
                        x = getCellViewPortX(targetCell),   // get the x position of the target cell
                        defer = x >= containerWidth              // whether the target cell is out of view and should be ignored for now

                    // if the target cell is out of the viewable screen or,
                    // if the target cell is partially visible / obscured then offset by the time interval
                    if (x >= containerWidth ||
                        ((x < containerWidth) && (x + targetCell.container.w > containerWidth))) {
                        xOffset = -1 * timeWidth
                        pageScroll = 'right'
                    }

                    callback(pageScroll, xOffset, defer)
                }
            },
            // given a targetCell and container width, this function will determine how much to scroll and 
            // invoke the callback function
            _leftScrollOffset: function (targetCell, timeWidth, callback,getCellViewPortX) {

                if (targetCell != null) {

                    var pageScroll, xOffset = 0,
                        // get the position of the grid container
                        gridX = targetCell.container.parent.parent.x,
                        // get the position of the target cell and determine if it is at the left most part of the
                        // screen or if it is partially obscured by the scrolling list
                        targetCellX1 = getCellViewPortX(targetCell),
                        targetCellX2 = targetCellX1 + targetCell.container.w,
                        defer = targetCellX2 < 0   // whether the target cell is out of view and should be ignored for now

                    // if the target cell is out of the viewable screen then offset by the time interval or,
                    // if the target cell is partially obscured and the grid is not in its starting position
                    if (targetCellX2 < 0 ||
                        (targetCellX1 < 0 && gridX != 0)) {
                        pageScroll = 'left'
                        xOffset = timeWidth
                    }

                    callback(pageScroll, xOffset, defer)
                }
            },
            registerLoadNeigborFunction: function (func) {

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
            keyCodeAction: function (e, currentCell, timeWidth, callback) {

                var targetCell, pageScroll, yOffset = 0, uiScrollingListYOffset = 0, placeHolderSectorLoad = null

                // sometimes, when the arrow is pressed down, pxscene can cause a speed-scroll, and it
                // possible that the target cell is currently loading asynchronously, hence the need to check if the
                // target cell is null before invoking any function that may result in an 'undefined' exception

                if (e.keyCode == 37 || e.keyCode == 39) {                              // LEFT or RIGHT ARROW

                    var offsetFunction = this._leftScrollOffset

                    targetCell = currentCell.config.prevCell

                    if (e.keyCode == 39) {
                        offsetFunction = this._rightScrollOffset
                        targetCell = currentCell.config.nextCell
                    }

                    // default to current cell if the target cell is null or if placeholder
                    if (targetCell == null || targetCell.config.data.placeholder) {
                        placeHolderSectorLoad = targetCell
                        targetCell = currentCell
                    }

                    offsetFunction(targetCell, timeWidth, function (scroll, offsetX, defer) {
                        if (defer)
                            targetCell = currentCell
                        callback(targetCell, null, scroll, offsetX, 0, 0, placeHolderSectorLoad)
                    },this.getCellViewPortX,this.containerGrid.w)

                }  else if (e.keyCode == 38) {                       // TOP ARROW

                    targetCell = this._getTopCell()

                    if (targetCell != null && targetCell.loaded) {

                        this.currentRow--
                        this.currentSectorRow--
                        if (this.currentViewRow > 0)
                            this.currentViewRow--

                        var found = false
                        while (found == false) {
                            var x = this.getCellViewPortX(targetCell)
                            var x2 = x + targetCell.container.w
                            if (x2 < 0.5 && x2 > 0) x2 = 0
                            if (x2 <= 0)
                                targetCell = targetCell.config.nextCell
                            else
                                found = true
                        }

                        if (this._cellIsAtTopRow(currentCell)) {    // we are the the top-most
                            pageScroll = 'down'
                            uiScrollingListYOffset = this.tileH
                            yOffset = this.tileH                    // move the page one tile down
                        }

                        // if the cell above is wider than the container, do not attempt diagonal move
                        callback(targetCell, pageScroll, null, 0, yOffset, uiScrollingListYOffset)
                    }

                } else if (e.keyCode == 40) {                       // DOWN ARROW

                    targetCell = currentCell.config.bottomCell

                    if (targetCell != null) {

                        // increment the individual counters 
                        this.currentRow++
                        this.currentSectorRow++
                        if (this.currentViewRow < 4)
                            this.currentViewRow++

                        // because we only adjust the left right scroll in half hour increments, it is possible that the
                        // target cell may be obscured - in which case we need to pick the target cell next to it
                        // or recurse until we find one that isn't obscured
                        var found = false
                        while (found == false) {
                            var x = this.getCellViewPortX(targetCell)
                            var x2 = x + targetCell.container.w
                            if (x2 < 0.5 && x2 > 0) x2 = 0
                            if (x2 <= 0)
                                targetCell = targetCell.config.nextCell
                            else
                                found = true
                        }

                        // determine if the target cell is at the bottom of the screen, and in which case
                        // scroll the entire page up by one tile height

                        if (this._cellIsAtBottomRow(currentCell)) {
                            pageScroll = 'up'
                            uiScrollingListYOffset = -1 * (this.tileH)
                            yOffset = -1 * (this.tileH)
                        }

                        // if the cell below is wider than the container, do not attempt diagonal move
                        callback(targetCell, pageScroll, null, 0, yOffset, uiScrollingListYOffset)

                    }
                } else if (e.keyCode == 33) {                   // PAGE UP
                    var i = 0
                    while (i < 5) {

                        if (targetCell == null) {
                            targetCell = currentCell.config.topCell
                            prevCell = currentCell
                        } else {
                            prevCell = targetCell
                            targetCell = targetCell.config.topCell
                        }

                        if (targetCell == null) {
                            targetCell = prevCell
                            break
                        }

                        i++
                        this.currentRow--
                        this.currentSectorRow--
                        if (this.currentViewRow > 0)
                            this.currentViewRow--
                    }

                    // because we only adjust the left right scroll in half hour increments, it is possible that the
                    // target cell may be obscured - in which case we need to pick the target cell next to it
                    // or recurse until we find one that isn't obscured
                    var found = false
                    while (found == false) {
                        var x = this.getCellViewPortX(targetCell)
                        var x2 = x + targetCell.container.w
                        if (x2 < 0.5 && x2 > 0) x2 = 0
                        if (x2 <= 0)
                            targetCell = targetCell.config.nextCell
                        else
                            found = true
                    }

                    if (i == 5) {
                        pageScroll = 'up'
                        uiScrollingListYOffset = 5 * (this.tileH)
                        yOffset = 5 * (this.tileH)
                    }

                    logger.log(targetCell.title.text)
                    // if the cell below is wider than the container, do not attempt diagonal move
                    callback(targetCell, pageScroll, null, 0, yOffset, uiScrollingListYOffset, 'top')

                }
                else if (e.keyCode == 34) {                   // PAGE DOWN

                    var i = 0
                    while (i < 5) {

                        if (targetCell == null) {
                            targetCell = currentCell.config.bottomCell
                            prevCell = currentCell
                        } else {
                            prevCell = targetCell
                            targetCell = targetCell.config.bottomCell
                        }

                        if (targetCell == null) {
                            targetCell = prevCell
                            break
                        }

                        i++
                        this.currentRow++
                        this.currentSectorRow++
                        if (this.currentViewRow < 4)
                            this.currentViewRow++
                    }

                    // because we only adjust the left right scroll in half hour increments, it is possible that the
                    // target cell may be obscured - in which case we need to pick the target cell next to it
                    // or recurse until we find one that isn't obscured
                    var found = false
                    while (found == false) {
                        var x = this.getCellViewPortX(targetCell)
                        var x2 = x + targetCell.container.w
                        if (x2 < 0.5 && x2 > 0) x2 = 0
                        if (x2 <= 0)
                            targetCell = targetCell.config.nextCell
                        else
                            found = true
                    }

                    if (i == 5) {
                        pageScroll = 'up'
                        uiScrollingListYOffset = -5 * (this.tileH)
                        yOffset = -5 * (this.tileH)
                    }

                    logger.log(targetCell.title.text)

                    callback(targetCell, pageScroll, null, 0, yOffset, uiScrollingListYOffset, 'bottom')
                }
            },
            // determines if the sector has changed, and if it has invokes the sectorChanged callback
            // additionally if the data in the next sector (of motion ex. top of next if movement is up arrow)
            // is empty then the second callback is invoked - that triggers fetching off and loading data
            sectorChange: function (currentSector, currentScrollingSector, currentTimeSector,
                prevCell, targetCell, overrideDirection, sectorChangeCallback, loadDataCallback,
                unloadActionCallback) {

                var nextSector, nextScrollingSector, nextTimeSector, loadNeighborDirection,
                    unloadScrollingSector,
                    previous = prevCell.config,
                    target = targetCell.config,
                    previousContainerId = prevCell.container.parent.id,
                    targetContainerId = targetCell.container.parent.id

                if (previousContainerId != targetContainerId) {

                    if (previous.bottomRow && target.topRow || overrideDirection == 'bottom') {

                        // we've crossed into the sector below
                        nextSector = currentSector.bottom
                        nextScrollingSector = currentScrollingSector.bottom
                        if (nextSector.bottom == null)
                            loadNeighborDirection = 'bottom'

                    } else if (previous.topRow && target.bottomRow || overrideDirection == 'top') {

                        // we've crossed into the sector above

                        nextSector = currentSector.top
                        nextScrollingSector = currentScrollingSector.top
                        if (nextSector.top == null)
                            loadNeighborDirection = 'top'

                    } else if (targetCell.config.data.placeholder) {
                        if (prevCell.config.nextCell.id == targetCell.id) {
                            nextSector = currentSector.right
                            nextTimeSector = currentTimeSector.right
                            if (nextSector.right == null)
                                loadNeighborDirection = 'right'
                        } else if (prevCell.config.prevCell.id == targetCell.id) {
                            nextSector = currentSector.left
                            nextTimeSector = currentTimeSector.left
                            if (nextSector.left == null)
                                loadNeighborDirection = 'left'
                        }

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
                        if (loadNeighborDirection != null) {
                            loadDataCallback(loadNeighborDirection, nextSector, nextScrollingSector, nextTimeSector)
                            unloadActionCallback(currentScrollingSector, currentSector, loadNeighborDirection)
                        }
                    }
                }
            }
            ,
            // this function handles the actions to undertake if the sector has changed
            determineSectorChangeAndLoadNeighboringData: function (cSector, currentScrollingSector, currentTimeSector,
                prevCell, targetCell, pageScroll, horizontalScroll,
                uiGrid, uiScrollingList, uiGridTime, overrideDirection) {

                var t = this

                // callback function indicating that the sector has changed and this warrants
                // drawing of cells and time line (off-screen)
                var sectorChangeActionCallback = function (nextSector, nextScrollingSector, nextTimeSector) {

                    // TODO - Destroy old sectors - come up with strategy
                    uiGrid.sectors.currentSector = nextSector

                    if (nextScrollingSector != null)
                        uiScrollingList.currentSector = nextScrollingSector
                    if (nextTimeSector != null)
                        uiGridTime.currentSector = nextTimeSector
                }

                // callback function indicating that the sector has changed and it warrants neighbor load
                var loadActionCallback = function (loadNeighborDirection, nextSector, nextScrollingSector, nextTimeSector) {

                    // add the right time sector ahead of the function call
                    // so that we know the time for data retrieval
                    if (loadNeighborDirection == "right")
                        uiGridTime.addRightSector()

                    // INVOKE THE REGISTERED LOAD DATA FUNCTION
                    // LOGIC to load data if we have crossed into a different sector
                    // only need to load data if the callback determines it is needed

                    var nextSector = nextSector
                    t.loadNeighbor(t.currentRow, t.currentSectorRow, loadNeighborDirection, function (data) {

                        if (loadNeighborDirection == "top") {
                            uiScrollingList.addTopSector(nextScrollingSector)
                            uiGrid.addTopSector(data.top, nextSector)
                            uiGrid.addTopRightSector(data.topRight, nextSector)
                            if (nextSector.left != null) {
                                uiGrid.addTopLeftSector(data.topLeft, nextSector)
                            }
                            t.currentSectorRow = 4
                        } else if (loadNeighborDirection == "bottom") {
                            uiScrollingList.addBottomSector(nextScrollingSector)
                            uiGrid.addBottomSector(data.bottom, nextSector)
                            uiGrid.addBottomRightSector(data.bottomRight, nextSector)
                            t.currentSectorRow = 0
                        } else if (loadNeighborDirection == "right") {
-                           uiGrid.addRightSector(data.right, nextSector)
-                           uiGrid.addBottomRightSector(data.bottomRight, nextSector)
-                           uiGrid.addTopRightSector(data.topRight, nextSector)
                         }
                       
                    })
                }

                // function for destroying sectors no longer visible to the viewer
                var unloadActionCallback = function (currentScrollingSector, currentSector, loadNeighborDirection) {

                    if (loadNeighborDirection == "top") {
                        uiScrollingList.removeBottomSector(currentScrollingSector)
                        uiGrid.removeBottomRightSector(currentSector)
                        uiGrid.removeBottomSector(currentSector)
                    } else if (loadNeighborDirection == "bottom") {
                        uiScrollingList.removeTopSector(currentScrollingSector)
                        uiGrid.removeTopRightSector(currentSector)
                        uiGrid.removeTopSector(currentSector)
                    } 

                    // TODO - handle unloading the left and right sectors during left/right scroll
                    // the problem with unloading the data is there might be cells that span multiple
                    // sectors and we need to deal with these correctly

                    // else if (loadNeighborDirection == "right") {
                    //     uiGrid.removeTopLeftSector(currentSector)
                    //     uiGrid.removeBottomLeftSector(currentSector)
                    //     uiGrid.removeLeftSector(currentSector)
                    // }
                }

                this.sectorChange(cSector, currentScrollingSector, currentTimeSector,
                    prevCell, targetCell,
                    overrideDirection,
                    sectorChangeActionCallback,
                    loadActionCallback,
                    unloadActionCallback)
            },
            handleTimeBarAnimate: function (timeAnimateConfig) {

                if (timeAnimateConfig != null) {
                    this.uiGridTime.timeContainer
                        .animateTo(timeAnimateConfig, animationSpeed,
                        scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
                        .then(function (obj) {
                            // TODO update the highlight on the timebar
                        })
                }
            }
            ,
            handleGridAnimate: function (gridAnimateConfig, callback) {

                var t = this
                if (gridAnimateConfig != null) {

                    // animate the container grid
                    t.containerGrid.animateTo(gridAnimateConfig, animationSpeed, scene.animation.TWEEN_STOP,
                        scene.animation.OPTION_LOOP, 1).then(function () {
                            callback()
                        })
                }
            },
            // as the grid scroll left or right, the title in each cell can get obscured. This function
            // re-adjusts the title inside the cells, so that they scroll in the opposite direction
            // until they are visible.
            handleTitleReadjustment: function (uiGrid, containerGridXPosition, scrollXOffset, scrollX) {

                if (scrollXOffset == 0)
                    return      // no point proceeding further as grid did not scroll left of right

                var t = this    // for references inside the inner function

                var adjustTitles = function (targetSector) {

                    var rows = targetSector.data

                    targetSector.data.forEach(function (rows) {

                        // nested loop through all cells in the reverse order, 
                        // break when first negative cell encountered
                        rows.forEach(function (row) {

                            // calculate the cells X1 and X2
                            var cell = row.cell,
                                cellViewPortXWithRespectToX = t.getCellViewPortXWithRespectToX(cell, containerGridXPosition),
                                off = cellViewPortXWithRespectToX + scrollXOffset,
                                offX2 = off + cell.container.w

                            // reset off and offX2 to 0 because there might be slight rounding errors
                            if (off > -1 && off < 0) off = 0
                            if (offX2 < 1 && offX2 > 0) offX2 = 0

                            if (off < 0 && offX2 > 0 && scrollX != 0) {

                                // if this is a partially obscured cell, then animate the title so that it is visible
                                cell.title.animateTo({
                                    x: Math.abs(off) + cell.title.y,
                                    w: cell.container.w - Math.abs(off) - cell.title.y
                                },
                                    animationSpeed, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)

                            } else {

                                if (cell != null && cell.title != null)
                                    // otherwise reset the title to its original position
                                    cell.title.animateTo({
                                            x: cell.titleXPosition, // use the original position, as
                                            w: cell.image.w - cell.title.y
                                        },
                                        animationSpeed, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
                            }
                        })
                    })
                }

                // return a list containing the current sector anf the sector to the left and right to it
                var getAdjustmentSectors = function (sector) {

                    var sectors = []

                    if (sector != null) {
                        sectors.push(sector)

                        // if there is no left sector - it is possible that scrolling occurred while in the current sector
                        var targetSector = sector.left
                        if (targetSector != null)
                            sectors.push(targetSector)

                        // if there is no right sector - it is possible that scrolling occurred while in the current sector
                        targetSector = sector.right
                        if (targetSector != null)
                            sectors.push(targetSector)
                    }
                    return sectors
                }

                var sectorsToAdjust = getAdjustmentSectors(uiGrid.sectors.currentSector)

                // if the current sector does NOT occupy the entire screen re-adjust either the top or 
                // bottom sector
                if (this.currentSectorRow > this.currentViewRow) {
                    sectorsToAdjust = sectorsToAdjust.concat(getAdjustmentSectors(uiGrid.sectors.currentSector.bottom))
                } else if (this.currentSectorRow < this.currentViewRow) {
                    sectorsToAdjust = sectorsToAdjust.concat(getAdjustmentSectors(uiGrid.sectors.currentSector.top))
                }

                sectorsToAdjust.forEach(function (sector) {
                    adjustTitles(sector)
                })
            }
            ,
            // registers various components with this controller, and also establishes what to do when keys are pressed
            register: function (containerGrid, uiGridSelector, uiScrollingList, uiGrid, uiGridTime, currentCell, scrollingListWidth,
                tileH, borderWidth, currentRow) {        // initialize the container with the key pressed hooks

                var scrollY = 0
                    scrollX = 0

                this.tileH = tileH

                var t = this

                t.containerGrid = containerGrid
                t.currentCell = currentCell
                t.currentRow = currentRow
                t.currentSectorRow = 0              // we need to keep track of where we are in each sector to help side data loading
                t.uiGridTime = uiGridTime
                t.uiGridSelector = uiGridSelector

                containerGrid.focus = true

                // move selector to current cell
                uiGridSelector
                    .init(tileH, containerGrid)
                    .render(currentCell)

                containerGrid.on("onKeyDown", function (e) {

                    var currentCell = t.currentCell,
                        currentSector = uiGrid.sectors.currentSector,
                        currentScrollingSector = uiScrollingList.currentSector,
                        currentTimeSector = uiGridTime.currentSector

                    t.keyCodeAction(e, currentCell, uiGridTime.timeSectorWidth,
                        function (targetCell, pageScroll, horizontalScroll, xOffset, yOffset, uiScrollingListYOffset, overrideDirection,
                            placeHolderSectorLoad) {

                            if (targetCell.loaded != true)
                                return                                                  // short circuit if contents of cell not loaded

                            // if (targetCell.config.data.placeholder)
                            //     targetCell = currentCell

                            t.currentCell = targetCell                                  // remember current program

                            var prevCell = currentCell                                  // record the previous cell

                            uiGrid.tileSelected(targetCell, prevCell)                    // highlights the next cell

                            var tCell = targetCell
                            if (placeHolderSectorLoad != null) {
                                tCell = placeHolderSectorLoad
                            }

                            t.determineSectorChangeAndLoadNeighboringData(currentSector, currentScrollingSector, currentTimeSector,
                                prevCell, tCell, pageScroll, horizontalScroll, uiGrid, uiScrollingList, uiGridTime, overrideDirection)

                            if (yOffset != null || yOffset != 0 || xOffset != null || xOffset != 0) {

                                scrollX += xOffset      // update the x and y scroll positions based on the offsets
                                scrollY += yOffset

                                if (scrollX > 0)        // if the scroll along the x-axis is 'drifting'
                                    scrollX = 0         // set to zero. TODO - figure out why there is a drift

                                // set up the animation parameters based on the scrolling direction
                                var gridAnimateConfig, timeAnimateConfig
                                if (horizontalScroll == 'right' || horizontalScroll == 'left') {
                                    // left /right scroll does not require the channel list to move
                                    timeAnimateConfig = gridAnimateConfig = { x: scrollX }
                                }
                                if (pageScroll == 'up' || pageScroll == 'down') {
                                    // top / down does not require the time-line to move
                                    uiScrollingList.update(uiScrollingListYOffset)
                                    gridAnimateConfig = { y: scrollY }
                                }

                                uiGridSelector.update(targetCell)

                                t.handleTitleReadjustment(uiGrid, t.containerGrid.x, xOffset, scrollX)
                                t.handleGridAnimate(gridAnimateConfig)
                                t.handleTimeBarAnimate(timeAnimateConfig)
                                uiGridTime.update(targetCell.config.data.s)

                            } else {
                                var y = t.getCellViewPortY(targetCell)
                                // TODO - add logic here to pan the guide left / right / up / down
                                // move the selector
                                uiGridSelector.update(targetCell, t.getCellViewPortY(targetCell))
                                uiGridTime.update(targetCell.config.data.s)
                            }
                        })
                })
            }
        }
    }

}).catch(function (err) {
    console.error("Error on Controller : ")
    console.log(err.stack)
});
