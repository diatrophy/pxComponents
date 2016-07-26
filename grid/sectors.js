// sectors.js
//
// An object that tracks grid sectors
//
// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js',
    imageEffects    : '../image/imageEffects.js',
    math            : '../math.js'
}).then(function importsAreReady(imports) {

    module.exports = function(scene) {

        var ret = {
            container:null,
            currentSector:null,
            // Adds a new sector above the current sector
            extendUp : function() {
                var newSectorYLoc = this.currentSector.container.y-this.container.h - this.borderWidth
                var newSectorXLoc = this.currentSector.container.x
                var sector = scene.create({t:'object',parent:this.container,a:1,w:this.container.w,
                    y:newSectorYLoc, x:newSectorXLoc, h:this.container.h})
                this.currentSector.top = {container:sector,bottom:this.currentSector}
                return this.currentSector.top
            },
            // Adds a new sector below the current sector
            extendDown : function() {
                var newSectorYLoc = this.currentSector.container.y+this.container.h + this.borderWidth
                var newSectorXLoc = this.currentSector.container.x
                var sector = scene.create({t:'object',parent:this.container,a:1,w:this.container.w,
                    y:newSectorYLoc, x:newSectorXLoc, h:this.container.h})
                this.currentSector.bottom = {container:sector,top:this.currentSector}
                return this.currentSector.bottom
            },
            // Adds a new sector to the right of the current sector
            extendRight : function() {
                var newSectorYLoc = this.currentSector.container.y
                var newSectorXLoc = this.currentSector.container.x + this.container.w
                var sector = scene.create({t:'object',parent:this.container,a:1,w:this.container.w,
                    x:newSectorXLoc,y:newSectorYLoc, h:this.container.h})
                this.currentSector.right = {container:sector,left:this.currentSector}
                return this.currentSector.right
            },
            // initialize the sectors object
            init : function(parent,borderWidth) {

                this.container = parent
                this.borderWidth = borderWidth
                this.currentSector = {container:scene.create({t:'object',parent:parent,a:1,w:parent.w})}
            }
        }

        return ret
    }

}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});