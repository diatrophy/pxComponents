// selector.js
//
// This component draws two vertical bars that represent the current selection
//
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    gridHelper: 'gridHelper.js'
}).then(function importsAreReady(imports) {

    var image = imports.image,
        gridHelper = imports.gridHelper(),
        borderWidth = 5

    module.exports = function (scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {

            init: function (h, container) {
                this.height = h - borderWidth
                this.container = container
                return this
            },
            // initial rendering of the selector
            render: function (cell) {

                var width = gridHelper.calculateCellWidth(cell, 0),
                    yLoc = cell.container.y,
                    t = this,
                    container = scene.create({t: 'object', parent: this.container, x: 0, y: yLoc - 2, w: width}),
                    lineConfig = {
                        t: 'rect', parent: container, fillColor: 0xCCCCCCFF, a: 1,
                        y: 0,
                        w: width, h: borderWidth
                    }

                // top line
                imageRenderer.render(image(lineConfig), function (top) {
                    t['top'] = top
                })

                lineConfig.y = this.height

                // bottom line
                imageRenderer.render(image(lineConfig), function (bottom) {
                    t['bottom'] = bottom
                })

                this['selector'] = container
            },
            // handles updating the location of the selector
            update: function (cell) {

                if (cell != null) {
                    
                    var animateConfig = {
                            x : cell.container.parent.x + cell.container.x,
                            y : cell.container.parent.y + cell.container.y,
                            w : cell.container.w
                        }

                    // update the width of the selectors

                    this.top.image.animateTo({
                        w: animateConfig.w,
                    }, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)

                    this.bottom.image.animateTo({
                        w: animateConfig.w,
                    }, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)

                    // update the position
                    
                    this.selector.animateTo(animateConfig, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
                }
            }
        }
    }

}).catch(function (err) {
    console.error("Error on Grid selector: ")
    console.log(err.stack)
});
