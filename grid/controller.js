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
            currentProgram : null,
            // get the cell above the currently selected cell
            // if a parameter is passed in - it determines the cell above the passed in param
            _getTopCell : function(cell) {
                if (cell == null)
                    return this.currentProgram.config.topCell
                else 
                    return cell.config.topCell
            },
            getCurrentProgramViewPortY : function(){
                return this.currentProgram.container.parent.y + this.currentProgram.container.y - (-1 * this.currentProgram.container.parent.parent.y)
            },
            // determines if the currently selected cell is in a bottom row of the view port
            _isAtBottomRow : function() {
                var y = this.getCurrentProgramViewPortY() + this.tileH *1.5
                return y > this.container.h
            },
            // determines if the currently selected cell is in a top row of the view port
            _isAtTopRow : function() {
                var y = this.getCurrentProgramViewPortY() - this.tileH *0.5
                return y < 0
            },
            // determines if the currently selected cell is at the right-most part of the screen
            _isAtRightColumn : function() {
                return this.currentProgram.config.rightColumn
            },
            // determines if the currently selected cell is at the left-most part of the screen
            _isAtLeftColumn : function() {
                return this.currentProgram.config.leftColumn
            },
            // registers various components with this controller, and also establishes what to do when keys are pressed
            register : function(container,containerGrid,uiGridSelector,currentProgram,scrollingListWidth,tileH,borderWidth) {        // initialize the container with the key pressed hooks
                
                var scrollY = 0
                var scrollX = 0

                this.tileH = tileH

                var t = this

                t.container = container
                t.currentProgram = currentProgram

                container.focus = true

                container.on("onKeyDown", function(e){

                    var pageScroll = null
                    var targetCell = null

                    if (e.keyCode == 37)                        // LEFT ARROW
                        targetCell = t.currentProgram.config.prevCell
                        if (targetCell != null && t._isAtLeftColumn()) {     // we are at the left most bound of this sector
                            pageScroll = 'left'                 // lets scroll right
                        }
                    else if (e.keyCode == 39) {                 // RIGHT ARROW
                        targetCell = t.currentProgram.config.nextCell
                        if (targetCell != null && t._isAtRightColumn()) {    // we are at the right most bound of this sector
                            pageScroll = 'right'                // lets scroll right
                        }
                    } else if (e.keyCode == 38) {               // TOP ARROW
                        targetCell = t._getTopCell()
                        if (t._isAtTopRow()) // && t.getTopCell(targetCell)) // we are the the top-most
                            pageScroll = 'down'
                    } else if (e.keyCode == 40) {               // DOWN ARROW
                        targetCell = t.currentProgram.config.bottomCell
                        if (t._isAtBottomRow())
                            pageScroll = 'up'                        
                    } else if (e.keyCode == 33) {               // PAGE UP
                        targetCell = null
                    } else if (e.keyCode == 44) {               // PAGE DOWN
                        targetCell = null               
                    }

                    var animationSpeed = 0.50

                    var uiScrollingListYOffset = 0

                    if (pageScroll != null && targetCell != null) {
                        
                        if (pageScroll == 'down') {
                            uiScrollingListYOffset = tileH + borderWidth
                            scrollY += (tileH +  borderWidth)                       // move the page one tile down
                        } else if (pageScroll == 'up') {
                            uiScrollingListYOffset = -1 * (tileH + borderWidth)
                            scrollY -=  (tileH  + borderWidth)                      // move the page one tile up
                        } else if (pageScroll == 'pagedown') {
                            scrollY = scrollY - container.h + borderWidth           // move the page one whole page down
                        } else if (pageScroll == 'pageup') {
                            scrollY = -1 * (scrollY + container.h - borderWidth )   // move the page one whole page up
                        }  else if (pageScroll == 'right') {
                            scrollX = scrollX - containerGrid.w                     // scroll the grid one whole container width right
                        }  else if (pageScroll == 'left') {
                            scrollX = scrollX + containerGrid.w                     // scroll the grid one whole container width right
                        }

                        var gridAnimateConfig

                        if (pageScroll == 'right' || pageScroll == 'left') {        // left /right scroll does not require the channel list to move
                            gridAnimateConfig = {x:scrollX}
                        } else if (pageScroll == 'up' || pageScroll == 'down') {
                            uiScrollingList.update(uiScrollingListYOffset)
                            gridAnimateConfig = {y:scrollY}
                        }

                        //TODO - prehaps this should be behavior that gets passed in via the sample, since it is tile specific

                        t.currentProgram.title.textColor = 0xffffffff                // change prev program title to grey
                        t.currentProgram = targetCell                                // remember curent program
                        targetCell.title.textColor = 0x1E90FFff                      // change current program title to blue
                       
                        uiGridSelector.update(targetCell,scrollingListWidth)

                        if (gridAnimateConfig != null)
                            containerGrid.animateTo(gridAnimateConfig,animationSpeed,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
                                .then(function(obj){
                                    if (targetCell != null && pageScroll != 'left' && pageScroll != 'right') {
                                        uiGridSelector.update(targetCell,scrollingListWidth,t.getCurrentProgramViewPortY())    // move the selector 
                                    }
                                })
                        
                        if (pageScroll == 'left' || pageScroll == 'right')
                            uiGridSelector.update(targetCell,scrollingListWidth)

                    } else if (targetCell != null) {
                        // TODO - add logic here to pan the guide left / right / up / down
                        t.currentProgram.title.textColor = 0xffffffff                                           // change prev program title to grey
                        t.currentProgram = targetCell                                                           // remember curent program
                        targetCell.title.textColor = 0x1E90FFff                                                 // change current program title to blue
                        uiGridSelector.update(targetCell,scrollingListWidth,t.getCurrentProgramViewPortY())     // move the selector 
                    }
                })
            }
        }
    }

}).catch( function(err){
    console.error("Error on Controller : ")
    console.log(err)
});
