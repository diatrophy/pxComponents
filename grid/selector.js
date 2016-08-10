// selector.js
//
// This component draws two vertical bars that represent the current selection in the grid
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    gridHelper      : 'gridHelper.js'
}).then(function importsAreReady(imports) {

    var image = imports.image
        gridHelper = imports.gridHelper()
     
    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            
            init    : function(h,container,xOffset) {
                this.borderWidth = 4
                this.height = h - this.borderWidth
                this.container = container
                this.xOffset = xOffset == null ? 0 : xOffset

                return this
            },
            // initial rendering of the selector
            render  : function(cell) {

                var xOffset = xOffset == null ? 0 : xOffset
                var xLoc    = this.xOffset
                var width = gridHelper.calculateCellWidth(cell,xOffset)
                
                var yLoc    = cell.container.y // - this.height - this.borderWidth
                var t       = this

                var container = scene.create({t:'object',parent:this.container,x:xLoc,y:yLoc-2,w:width})

                // top line
                imageRenderer.render(image({t:'rect',parent:container,fillColor:0xCCCCCCFF,a:1,
                    y:1,
                    w:width,h:this.borderWidth}),function(top){
                    t['top'] = top
                })
                            
                // bottom line
                imageRenderer.render(image({t:'rect',parent:container,fillColor:0xCCCCCCFF,a:1,
                    y:this.height + 2,
                    w:width,h:this.borderWidth}),function(bottom){
                    t['bottom'] = bottom
                })

                this['selector'] = container
            },
            // handles updating the location of the selector
            update : function(cell,xLoc,yOffset) {

                if (cell == null)
                    return

                // update the location of the selector
                var yLoc = yOffset - (this.borderWidth / 2)      // take into account border

                var animateConfig = {
                    w: cell.container.w,
                }
                console.log(animateConfig)

                if (yOffset != null) {
                    animateConfig.y = yLoc
                }

                if (xLoc != null) {
                    animateConfig.x = xLoc
                }

                // check if the cell will be obscured by the scrolling list and if this is the first column in the grid
                // use the default offset, otherwise set it to zero
                var xOff = this.xOffset
                if (cell.config.leftColumn == true && cell.config.prevCell != null) {
                    xOff = 0
                }

                var width = gridHelper.calculateCellWidth(cell, xOff)

                // check if the cell will be obscured by the scrolling list and if this is the first column in the grid
                if (cell.container.x < this.xOffset && (cell.config.leftColumn == true && cell.config.prevCell == null) ) {
                    width += this.xOffset
                }

                animateConfig.w = width

                console.log(animateConfig)
                this.top.image.animateTo({
                    w: animateConfig.w,
                }, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)

                this.bottom.image.animateTo({
                    w: animateConfig.w,
                }, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)

                this.selector.animateTo(animateConfig, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
            }
        }
    }

}).catch( function(err){
    console.error("Error on Grid selector: ")
    console.log(err)
});
