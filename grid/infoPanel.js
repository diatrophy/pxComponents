// infoPanel.js
//
// Jason Coelho

px.import({
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js'
}).then(function importsAreReady(imports) {

    var image = imports.image

    var greyColor = 0x999999ff

    module.exports = function (scene) {

        var imageRenderer = imports.imageRenderer(scene)

        return {
            init: function (container, xOffset, scrollingListWidth,imgW,imgH) {
                this.container = container
                this.xOffset = xOffset
                this.scrollingListWidth = scrollingListWidth
                this.imgW = imgW
                this.imgH = imgH
                return this
            },
            registerTimeRenderFunction: function (func) {
                this.timeRenderFunc = func
                return this
            },
            registerDetailsFunction: function (func) {
                this.detailsFunc = func
                return this
            },
            registerTimeUpdateFunction: function (func) {

            },
            render: function (imageUrl) {

                imageUrl = imageUrl == null ? "" : imageUrl

                // horizontal line (top)
                scene.create({
                    t: 'rect',
                    parent: this.container,
                    x: this.xOffset,
                    y: 0,
                    w: scene.w,
                    h: 1,
                    fillColor: greyColor
                })

                var t = this,
                    yOffset = this.container.h * 0.09,
                    imageYOffset = this.container.h * 0.07,
                    timeYOffset = this.container.h * 0.25

                // vertical line in info container
                var infoOffsetLeftX = this.container.w - Math.round(this.container.w / 3)
                scene.create({
                    t: 'rect',
                    parent: this.container,
                    x: infoOffsetLeftX,
                    y: timeYOffset,
                    w: 1,
                    h: this.container.h * 0.35,
                    fillColor: greyColor
                })

                // program image
                imageRenderer.render(
                    image({
                        url: imageUrl,
                        parent: this.container,
                        w: t.imgW,
                        h: t.imgH,
                        x: this.xOffset,
                        y: imageYOffset
                    })
                    , function (bgImage) {
                        t.infoImage = bgImage
                    })

                // container that holds the time and channel
                this.infoTimeContainer = scene.create({
                    t: 'rect',
                    x: this.container.w - Math.round(this.container.w / 3),
                    y: timeYOffset,
                    a: 1,
                    w: 450,
                    h: 240,
                    fillColor: 0xffffff00,
                    parent: this.container
                })

                // container that holder the title and description
                this.detailsContainer = scene.create({
                    t: 'rect',
                    x: this.scrollingListWidth,
                    y: yOffset,
                    a: 1,
                    w: 750,
                    h: 240,
                    fillColor: 0xffffff00,
                    parent: this.container
                })

                // invoke the user supplied function when the container is ready
                this.infoTimeContainer.ready.then(function (img) {
                    t.timeRenderFunc(img)
                })

                // invoke the user supplied details function when the container is ready
                this.detailsContainer.ready.then(function (img) {
                    t.detailsFunc(img)
                })

                return this
            },
            update: function (url, startTime, endTime) {
                // check if info image is ready
                if (this.infoImage != null) {
                    this.infoImage.image.url = url
                }
            }
        }
    }

}).catch(function (err) {
    console.error("Error on Info Panel: ")
    console.log(err)
});