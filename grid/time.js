// time.js
//
// Jason Coelho


px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js'
}).then(function importsAreReady(imports) {

    var image = imports.image
     
    module.exports = function(scene) {

        var DEFAULT_TIME_GROUPS = 6.5
        var imageRenderer = imports.imageRenderer(scene)
        var font = scene.create({t:"fontResource",url:"http://www.pxscene.org/examples/px-reference/fonts/IndieFlower.ttf"});

        return {
            
            init    : function(h,container) {
                this.borderWidth = 4
                this.height = h - this.borderWidth
                this.container = container
                this.timeGroups = DEFAULT_TIME_GROUPS
                return this
            },
            tileRenderFunction : function(func) {
                // we register rendering action here for each individual tile 
                this.tileRenderFunction = func
                return this
            },
            // initial rendering of the selector
            render  : function(xOffset) {

                var xOffset = xOffset == null ? 0 : xOffset
                var t       = this

                var container = scene.create({t:'object',parent:this.container,x:xOffset,y:0})
                var wid = Math.round(this.container.w / this.timeGroups)

                var timeOffset = 0
                for (var i =0; i<this.timeGroups; i++) {
                    // top line
                    imageRenderer.render(image({t:'rect',parent:container,a:1,
                        x:timeOffset,
                        y:0,
                        w:wid,
                        h:this.container.h}),function(timeTile){
                            t.tileRenderFunction(timeTile,"1:20")
                    })
                    timeOffset += wid
                }

                this['selector'] = container
            },
            // handles updating the location of the selector
            update : function() {

            }
        }
    }

}).catch( function(err){
    console.error("Error on Grid selector: ")
    console.log(err)
});
