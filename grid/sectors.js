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

    var transparentColor = 0xffffff00

    module.exports = function(scene) {

        var ret = {
            container:null,
            currentSector:null,
            _createSector : function(newSectorXLoc,newSectorYLoc){
                var id = "sector-" + Math.random()
                return scene.create({id:id,t:'object',parent:this.container,a:1,w:this.container.w,fillColor:transparentColor,
                    y:newSectorYLoc, x:newSectorXLoc, h:this.sectorHeight})
            },
            // Adds a new sector above the current sector
            extendUp : function(relativeSector) {
                var newSectorYLoc = relativeSector.container.y - this.sectorHeight - this.borderWidth
                var newSectorXLoc = relativeSector.container.x
                var sector = this._createSector(newSectorXLoc,newSectorYLoc)
                relativeSector.top = {container:sector,bottom:relativeSector}
                return relativeSector.top
            },
            // Adds a new sector below the current sector
            extendDown : function(relativeSector) {
                var newSectorYLoc = relativeSector.container.y + this.sectorHeight  + this.borderWidth
                var newSectorXLoc = relativeSector.container.x
                var sector = this._createSector(newSectorXLoc,newSectorYLoc)
                relativeSector.bottom = {container:sector,top:relativeSector}
                return relativeSector.bottom
            },
            // Adds a new sector to the right of the current sector
            extendRight : function(relativeSector) {
                var newSectorYLoc = relativeSector.container.y
                var newSectorXLoc = relativeSector.container.x + this.container.w
                var sector = this._createSector(newSectorXLoc,newSectorYLoc)
                relativeSector.right = {container:sector,left:relativeSector}
                return relativeSector.right
            },
            // initialize the sectors object
            init : function(parent,borderWidth,sectorHeight) {

                this.container = parent
                this.borderWidth = borderWidth
                this.sectorHeight = sectorHeight
                this.currentSector = {container:this._createSector(0,0)}

                return this.currentSector
            }
        }

        return ret
    }

}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});