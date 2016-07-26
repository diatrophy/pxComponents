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
            extendUp : function(relativeSector) {
                var newSectorYLoc = relativeSector.container.y-this.container.h - this.borderWidth
                var newSectorXLoc = relativeSector.container.x
                var sector = scene.create({t:'object',parent:this.container,a:1,w:this.container.w,
                    y:newSectorYLoc, x:newSectorXLoc, h:this.container.h})
                relativeSector.top = {container:sector,bottom:relativeSector}
                return relativeSector.top
            },
            // Adds a new sector below the current sector
            extendDown : function(relativeSector) {
                var newSectorYLoc = relativeSector.container.y+this.container.h + this.borderWidth
                var newSectorXLoc = relativeSector.container.x
                var sector = scene.create({t:'object',parent:this.container,a:1,w:this.container.w,
                    y:newSectorYLoc, x:newSectorXLoc, h:this.container.h})
                relativeSector.bottom = {container:sector,top:relativeSector}
                return relativeSector.bottom
            },
            // Adds a new sector to the right of the current sector
            extendRight : function(relativeSector) {
                var newSectorYLoc = relativeSector.container.y
                var newSectorXLoc = relativeSector.container.x + this.container.w
                var sector = scene.create({t:'object',parent:this.container,a:1,w:this.container.w,
                    x:newSectorXLoc,y:newSectorYLoc, h:this.container.h})
                relativeSector.right = {container:sector,left:relativeSector}
                return relativeSector.right
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