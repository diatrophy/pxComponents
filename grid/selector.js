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
                var yLoc    = cell.container.y // - this.height - this.borderWidth
                var t       = this

                var container = scene.create({t:'object',parent:this.container,x:xLoc,y:yLoc-2})

                // top line
                imageRenderer.render(image({t:'rect',parent:container,fillColor:0xCCCCCCFF,a:1,
                    y:1,
                    w:cell.container.w,h:this.borderWidth}),function(top){
                    t['top'] = top
                })
                            
                // bottom line
                imageRenderer.render(image({t:'rect',parent:container,fillColor:0xCCCCCCFF,a:1,
                    y:this.height + 2,
                    w:cell.container.w,h:this.borderWidth}),function(bottom){
                    t['bottom'] = bottom
                })

                this['selector'] = container
            },
            // handles updating the location of the selector
            update : function(cell,xLoc,yOffset) {

                if (cell == null)
                    return

                // update the location of the selector
                var yLoc = yOffset - (this.borderWidth/2)      // take into account border

                this.top.image.animateTo({
                    w:cell.container.w,
                },0.50,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)

                this.bottom.image.animateTo({
                    w:cell.container.w,
                },0.50,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)

                // move the selector
                if (yOffset != null) {
                    this.selector.animateTo({
                        x:xLoc,y:yLoc,w:cell.container.w,
                    },0.50,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
                } else if (xLoc != null) {
                    this.selector.animateTo({
                        x:xLoc,w:cell.container.w,
                    },0.50,scene.animation.TWEEN_STOP,scene.animation.OPTION_LOOP, 1)
                }
            }
        }
    }

}).catch( function(err){
    console.error("Error on Grid selector: ")
    console.log(err)
});
