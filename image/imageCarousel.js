// imageCarousel.js

px.import({
    imageRenderer   : 'imageRenderer.js',
    math            : '../math.js'
}).then(function importsAreReady(imports) {

    var math = imports.math()
     
    module.exports = function(scene) {

        return {
            selection   : 0,
            config  : {
                tiles : []
            },
            init    : function(uiImageList) {
                this.config.uiImageList = uiImageList
                return this
            },  
            // this function renders the image carousel
            render  : function(callback) {

                var imageRenderer = imports.imageRenderer(scene)

                var font = scene.create({t:"fontResource",url:"http://www.pxscene.org/examples/px-reference/fonts/IndieFlower.ttf"});

                var tiles   = this.config.tiles,            // track all the tiles
                    imgList = this.config.uiImageList,
                    t       = this                          // reference for inner function use

                var w = imgList[0].config.w,                // intialize the w/h/top to the first img
                    h = imgList[0].config.h,
                    top = imgList[0].config.y

                // create a container, a carousel container and a tile holder
                this.container = scene.create({t:"rect", fillColor:0x00000080, w:1200, h:600, parent:scene.root,clip:true})
                var carouselContainer = scene.create({t:"rect",parent:this.container})
                this.carouselContainer = carouselContainer
                this.title = scene.create({t:"textBox",w:w*1.5,h:200,parent:this.container,y:top+(h*1.25),
                              pixelSize:25,textColor:0xffffffff,font:font,
                              alignHorizontal:scene.alignHorizontal.CENTER,
                              wordWrap:true, clip:true, leading:-10,
                              truncation:scene.truncation.TRUNCATE_AT_WORD});  

                carouselContainer.a = 0     // set intial alpha to 0

                var tempMap = {}

                // update all img parent to the carousel container
                for (var i = 0; i < imgList.length; i++) {
                    imgList[i].config.parent = this.carouselContainer 
                }

                imageRenderer.renderList(imgList,function(uiImage){
                    // the following image transforms, sets the rotation along the y axis 
                    // in the center of the image. The reason will be evident in the updateSelection
                    // function that takes care of giving the appearance that the tile is tilted in or 
                    // out dependending on which side of the selected image it is
                    uiImage.image.cx = uiImage.image.w/2
                    uiImage.image.cy = uiImage.image.h/2
                    uiImage.image.ry = 1
                    uiImage.image.rz = 0
                },function(imageTiles){

                    // push tiles into this objct
                    for (var i = 0; i < imageTiles.length; i++) {
                        tiles.push(imageTiles[i])
                    }

                    // after the initial rendering we need to give all the images to the right the 
                    // effect that they lay under each other
                    for (var i = tiles.length-1; i >= 0; i--) {
                        tiles[i].container.moveToFront()
                    }

                    carouselContainer.a = 1         // after all the tiles have been rendered make container appear

                    // and this animates all the images to the right (from the intial location) 
                    t._updateSelection(-1,0)

                    callback(t)
                })

                return this
            },
            // move the selection left or right
            navigate : function(direction,preCallback,callback) {

                var oldSelection = newSelection = this.selection // default

                var max = this.config.tiles.length - 1

                // the following logic limits the new selection to available tiles
                if (direction == 'left' || direction == 37)
                    newSelection = math.clamp(this.selection-1,0,max)
                else if (direction == 'right' || direction == 39)
                    newSelection = math.clamp(this.selection+1,0,max)
                

                if (oldSelection != newSelection) {
                    this._updateSelection(oldSelection<=1?-1:oldSelection,newSelection,preCallback,callback)
                }                                

                preCallback()

            },
            // function that handles animating the carousel left or right
            _updateSelection : function(oldSelection, newSelection,preCallback, callback) {

                var x = 50;
                var wspace = 50;
                var r = 45;
                var tween = scene.animation.TWEEN_STOP
                     
                var tiles = this.config.tiles

                for (var i = 0; i < tiles.length; i++) {
                    console.log(' updating selection ')
                    var o = tiles[i].image
                    var w = o.w

                    if (i == newSelection) {    // handle the selection animation
                        
                        if (newSelection > 0) x += w

                        tiles[i].container.moveToFront()
                        o.animateTo({r:0,sx:1.5,sy:1.5,x:x},0.8,tween,scene.animation.LOOP,1)

                        // scroll selection into view
                        this.carouselContainer.animateTo({x:math.min(0,-(x-(this.container.w-(3*w))))},0.3,tween,scene.animation.LOOP,1);

                        var tempX = math.clamp(math.min(0,-(x-(this.container.w-(3*w))))+x-(w*.25)+50,0,scene.w);
                        // make the tile move to underneath the image
                        this.title.animateTo({x:tempX},0.3,tween,scene.animation.LOOP,1).then(function(obj){
                            if (callback != null) {
                                callback(tiles[i])
                            }
                        });

                        x += w+wspace;
                    } else {                    // handle tiles to the left or right
                        if (oldSelection == -1 || i == oldSelection) {
                            o.animateTo({r:i<newSelection?-r:r,sx:1,sy:1,x:x},0.8,tween,scene.animation.LOOP,1)
                        }
                        x+= wspace;
                    } 
                }
                this.selection = newSelection;
            },
        }
    }

}).catch( function(err){
    console.error("Error on Image Carousel: ")
    console.log(err)
});
