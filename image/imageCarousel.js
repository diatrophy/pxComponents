// imageCarousel.js

px.import({
    imageRenderer   : 'imageRenderer.js',
    math            : '../math.js'
}).then(function importsAreReady(imports) {

    var math = imports.math()
     
    module.exports = function(scene) {

        var styles = ['tilted','flat']

        var font = scene.create({t:"fontResource",url:"http://www.pxscene.org/examples/px-reference/fonts/IndieFlower.ttf"});

        return {
            selection   : 0,
            prevSelection : -1,
            preNavigateAction       : null,
            postNavigateAction      : null,
            style                   : 0,
            config  : {
                tiles : []
            },
            init    : function(uiImageList,style,cParent,cW,cH,xOffset,defaultSelection) {

                this.xOffset = xOffset
                if (defaultSelection != null)
                    this.selection = defaultSelection

                // defaults to 1080p resolution if none provided
                cW = cW == null ? 1920 : cW
                cH = cH == null ? 1080 : cH

                this.config.uiImageList = uiImageList
                this.style = style == null ? 0 : style

                var w = uiImageList[0].config.w,                // intialize the w/h/top to the first img
                    h = uiImageList[0].config.h,
                    top = uiImageList[0].config.y

                // create a container, a carousel container and a tile holder
                this.container = scene.create({t:"rect", a:0, fillColor:0x00000080, w:cW, h:cH, parent:cParent,clip:true})
                this.carouselContainer = scene.create({t:"rect",parent:this.container})

                var fontY = top+(h*1.25)
                if (this.style == 1) {
                    fontY = top+(h*1.05)
                }

                this.title = scene.create({t:"textBox",w:w,h:200,parent:this.container,y:fontY,
                              pixelSize:25,textColor:0xffffffff,font:font,
                              alignHorizontal:scene.alignHorizontal.CENTER,
                              wordWrap:true, clip:true, leading:-10,
                              truncation:scene.truncation.TRUNCATE_AT_WORD})

                // update all img parent to the carousel container
                for (var i = 0; i < uiImageList.length; i++) {
                    uiImageList[i].config.parent = this.carouselContainer 
                    if (style == 1) {
                      console.log( 'effects' + uiImageList[i].effects )
                    }
                }

                return this
            },  
            // this function renders the image carousel
            render  : function(callback) {

                var imageRenderer = imports.imageRenderer(scene)

                var tiles   = this.config.tiles,            // track all the tiles
                    imgList = this.config.uiImageList,
                    t       = this                          // reference for inner function use

                var w = imgList[0].config.w,                // intialize the w/h/top to the first img
                    h = imgList[0].config.h,
                    top = imgList[0].config.y

                this.carouselContainer.on("onKeyDown", function(e){

                    if(e.keyCode == 13) {                   // if ENTER was pressed
                        t.selectAction(t)
                    } else {
                        t.navigate(e.keyCode)
                    }
                })

                var tempMap = {}

                imageRenderer.renderList(imgList,function(uiImage){
                    
                },function(imageTiles){

                    // push tiles into this object
                    for (var i = 0; i < imageTiles.length; i++) {
                        tiles.push(imageTiles[i])
                    }

                    // after the initial rendering we need to give all the images to the right the 
                    // effect that they lay under each other
                    for (var i = tiles.length-1; i >= 0; i--) {
                        tiles[i].container.moveToFront()
                    }

                    t.container.a = 1                    // after all the tiles have been rendered make container appear

                    // and this animates all the images to the right (from the intial location) 
                    t._updateSelection(-1,t.selection)

                    t.carouselContainer.focus = true

                    callback(t)
                })

                return this
            },
            _imageFillsScreen : function() {
                return ((this.config.tiles.length * this.config.tiles[0].image.w) <= this.container.w)
            },
            // move the selection left or right
            navigate : function(direction,preCallback,callback) {

                var oldSelection = newSelection = this.selection // default

                var max = this.config.tiles.length - 1

                // the following logic limits the new selection to available tiles
                if (direction == 'left' || direction == 37)
                    if (this.style == 1 && this.selection == 0 ) { //&& this._imageFillsScreen()) {
                        newSelection = max
                    } else
                        newSelection = math.clamp(this.selection-1,0,max)
                else if (direction == 'right' || direction == 39)
                    if (this.style == 1 && this.selection == max ) { //} && this._imageFillsScreen()) {
                        newSelection = 0
                    } else
                        newSelection = math.clamp(this.selection+1,0,max)
                else
                    return  // the direction wasn't left or right so return

                if (oldSelection != newSelection) {
                    this._updateSelection(oldSelection<=1?-1:oldSelection,newSelection)
                }                                
            },
            // function that handles animating the carousel left or right
            // a lot of the styling code is customized in here
            _updateSelection : function(oldSelection, newSelection) {

                var x = this.xOffset
                var wspace = 50;
                var tween = scene.animation.TWEEN_STOP
                var t = this

                var tiles = this.config.tiles
                this.prevSelection = this.selection
                this.selection = newSelection

                for (var i = 0; i < tiles.length; i++) {

                    var currentTile = tiles[i]
                    var o = currentTile.container
                    var w = o.w

                    if (this.style == 0) {
                        // the following image transforms, sets the rotation along the y axis 
                        // in the center of the image. The reason will be evident later in the section
                        // takes care of giving the appearance that the tile is tilted in or 
                        // out dependending on which side of the selected image it is
                        o.cx = o.w/2
                        o.cy = o.h/2
                        o.ry = 1
                        o.rz = 0
                    }

                    if (i == newSelection) {    // handle the selection animation

                        this.preNavigateAction(t)

                        if (newSelection > 0 && this.style == 0) x += w

                        o.moveToFront()
                        if (this.style == 0) {
                            o.animateTo({r:0,sx:1.5,sy:1.5,x:x},0.8,tween,scene.animation.LOOP,1)
                        } else if (this.style == 1) {
                            o.animateTo({r:0,sx:1,sy:1,x:x},0.8,tween,scene.animation.LOOP,1)
                        }

                        // scroll selection into view

                        // if carouselScrollX is a negative number then it means that the X position 
                        // is sufficiently close to the right side of the screen to warrant the container scrolling
                        var carouselScrollPad = 3*w  // lee-way before we need to scroll ( 3 times the image width)

                        if (this.style == 1 && this._imageFillsScreen()) {
                            // be smart and set scroll Padding to zero if the current images fill the entire screen
                            // ie. no reason to scroll the carousel into view if there are no more images out of view
                            carouselScrollPad = 0  
                        }

                        var carouselScrollX = math.min(0,-(x-(this.container.w - carouselScrollPad))) 

                        this.carouselContainer.animateTo({x:carouselScrollX},0.3,tween,scene.animation.LOOP,1);

                        // var tempX = math.clamp(carouselScrollX + x - (w*.25) + 50,0,scene.w);
                        var tempX = math.clamp(carouselScrollX + x, 0,scene.w);

                        // make the tile move to underneath the image
                        var postNavigateAction = this.postNavigateAction
                        this.title.moveToFront()
                        this.title.animateTo({x:tempX},0.3,tween,scene.animation.LOOP,1).then(function(obj){
                            postNavigateAction(currentTile,obj)
                        });

                        if (this.style == 0) {
                            x += w+wspace
                        } else if (this.style == 1) {
                            x += w+20
                        }
                    } else {                    // handle tiles to the left or right
                        if (oldSelection == -1 || i == oldSelection) {
                            if (this.style == 0) {
                                o.animateTo({r:i<newSelection?-45:45,sx:1,sy:1,x:x},0.8,tween,scene.animation.LOOP,1)
                            } else if (this.style == 1) {
                                o.animateTo({r:0,sx:1,sy:1,x:x},0.8,tween,scene.animation.LOOP,1)
                            }
                        }
                        if (this.style == 0) {
                            x += wspace
                        } else if (this.style == 1) {
                            x += o.w+20
                        }
                    } 
                }
            },
            navigateAction : function(preTile,postTitle) {

                this.preNavigateAction = preTile
                this.postNavigateAction = postTitle
                return this
            },
            selectAction : function(action) {

                this.selectAction = action
                return this
            }
        }
    }

}).catch( function(err){
    console.error("Error on Image Carousel: ")
    console.log(err)
});
