// starRatings.js

px.import({
    imageRenderer   : 'imageRenderer.js',
    math            : '../math.js'
}).then(function importsAreReady(imports) {

    module.exports = function(scene) { 

        var starImage   = scene.create({t:"imageResource",url:"http://www.pxscene.org/examples/px-reference/gallery/images/gold_star.png"}),
            maxStars    = 5,
            starWidth   = 40,
            starHeight  = 40;

        return {
            starHolder:null,
            stars:[],
            init : function(parent,imgY,imgHeight) {

                // create the star holder and the stars
                this.starHolder = scene.create({t:"rect",parent:parent,w:75,h:15,y:imgY+(imgHeight*1.25)+60,a:0,fillColor:0x000000f00});
                for(var i = 0; i < maxStars; i++) {
                    this.stars[i] = scene.create({t:"image",parent:this.starHolder,x:i*starWidth,y:0,w:1,h:1,cx:starWidth*0.5,cy:starHeight*0.5, resource:starImage,a:0});
                } 
                return this 
            },
            // animate each star fly in
            anim : function(starNum, total, starX) {
                // limit to program's stars
                if (starNum < total) {

                    // Animate the stars into view 
                    this.stars[starNum].animateTo({a:1,w:starWidth,h:starHeight },0.5,scene.animation.EASE_IN_BOUNCE,scene.animation.LOOP, 1);
                    // Spin the stars
                    this.stars[starNum].animateTo({r:360},60,scene.animation.TWEEN_LINEAR,scene.animation.LOOP,scene.animation.COUNT_FOREVER);

                    starNum++;
                    this.anim(starNum, total,starX); // recursion
                }     
            },
            // as the name indicates - the stars are reset back to the starting animation position
            resetStars : function () {
                this.starHolder.animateTo({a:0},0.1,scene.animation.TWEEN_STOP,scene.animation.LOOP,1);
                for(var i = 0; i <maxStars; i++) {
                      this.stars[i].h = 1;
                      this.stars[i].w = 1;
                      this.stars[i].a = 0;
                      this.stars[i].r = 0;
                }
            },
            animStars : function(starY, starX, numStars) {
                this.starHolder.animateTo({a:1,y:starY,x:starX-((numStars*starWidth)/2)},0.2,scene.animation.TWEEN_LINEAR,scene.animation.LOOP,1);
                this.anim(0, numStars, starX);
            }
        }
    }

})
