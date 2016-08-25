// selector.js
//
// This component draws two vertical bars that represent the current selection in the grid
//
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    gridHelper: 'gridHelper.js'
}).then(function importsAreReady(imports) {

    var image = imports.image
    gridHelper = imports.gridHelper()

    module.exports = function (scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {

            init: function (h, container) {
                this.borderWidth = 5
                this.height = h - this.borderWidth
                this.container = container
                return this
            },
            // initial rendering of the selector
            render: function (cell) {

                var width = gridHelper.calculateCellWidth(cell, 0)

                var yLoc = cell.container.y
                var t = this

                var container = scene.create({t: 'object', parent: this.container, x: 0, y: yLoc - 2, w: width})

                // top line
                imageRenderer.render(image({
                    t: 'rect', parent: container, fillColor: 0xCCCCCCFF, a: 1,
                    y: 1,
                    w: width, h: this.borderWidth
                }), function (top) {
                    t['top'] = top
                })

                // bottom line
                imageRenderer.render(image({
                    t: 'rect', parent: container, fillColor: 0xCCCCCCFF, a: 1,
                    y: this.height + 2,
                    w: width, h: this.borderWidth
                }), function (bottom) {
                    t['bottom'] = bottom
                })

                this['selector'] = container
            },
            getXWithRespectToGridContainer: function (cell) {
                return cell.container.parent.x + cell.container.x
            },
            getYWithRespectToGridContainer: function (cell) {
                return cell.container.parent.y + cell.container.y
            },
            // handles updating the location of the selector
            update: function (cell) {

                if (cell == null)
                    return

                var animateConfig = {}

                animateConfig.y = this.getYWithRespectToGridContainer(cell) - (this.borderWidth / 4)
                animateConfig.x = this.getXWithRespectToGridContainer(cell)

                animateConfig.w = cell.container.w

                this.top.image.animateTo({
                    w: animateConfig.w,
                }, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)

                this.bottom.image.animateTo({
                    w: animateConfig.w,
                    y: cell.container.h - this.borderWidth / 2 ,
                }, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)

                this.selector.animateTo(animateConfig, 0.50, scene.animation.TWEEN_STOP, scene.animation.OPTION_LOOP, 1)
            }
        }
    }

}).catch(function (err) {
    console.error("Error on Grid selector: ")
    console.log(err)
});
