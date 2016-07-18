// selector.js
//
// This component draws two vertical bars that represent the current selection in the grid
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js'
}).then(function importsAreReady(imports) {

    var image = imports.image
     
    module.exports = function(scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            
            init    : function(h,container) {
                this.borderWidth = 4
                this.height = h - this.borderWidth
                this.container = container
                return this
            },
            // initial rendering of the selector
            render  : function(cell,xOffset) {

                var xOffset = xOffset == null ? 0 : xOffset
                var xLoc    = cell.container.x + xOffset
                var yLoc    = cell.container.y
                var t       = this

                var container = scene.create({t:'object',parent:this.container,x:xLoc,y:yLoc-2})

                // top line
                imageRenderer.render(image({t:'rect',parent:container,fillColor:0xCCCCCCFF,a:1,
                    y:yLoc,
                    w:cell.container.w,h:this.borderWidth}),function(top){
                    t['top'] = top
                })
                            
                // bottom line
                imageRenderer.render(image({t:'rect',parent:container,fillColor:0xCCCCCCFF,a:1,
                    y:yLoc+this.height + 1,w:cell.container.w,h:this.borderWidth}),function(bottom){
                    t['bottom'] = bottom
                })

                this['selector'] = container
            },
            // handles updating the location of the selector
            update : function(cell,xOffset) {

                if (cell == null)
                    return

                // update the location of the selector
                var xOffset = xOffset == null ? 0 : xOffset
                var xLoc = cell.container.x + xOffset                   // take into account an offset - if the encompassing obj has a side bar
                var yLoc = cell.container.y - (this.borderWidth/2)      // take into account border

                // the width of the horizontal lines are resized
                var t = this.top.image
                var b = this.bottom.image
                t.w = b.w = cell.container.w

                // move the selector
                this.selector.animateTo({
                    x:xLoc,y:yLoc,w:cell.container.w,
                },0.50,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
            }
        }
    }

}).catch( function(err){
    console.error("Error on Grid selector: ")
    console.log(err)
});
