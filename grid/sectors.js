// sectors.js
//
// An object that tracks grid sectors
//
// Jason Coelho

px.import({
    memoryPool : '../util/memoryPool.js'

}).then(function importsAreReady(imports) {

    var MemoryPool = imports.memoryPool,
        memoryPool = new MemoryPool()  // TODO - make global

    var transparentColor = 0xffffff00

    module.exports = function (scene) {

        memoryPool.register('gridSector', function (id) {

            return {
                container: scene.create({
                    id: id,
                    t: 'object',
                    a: 1,
                    fillColor: transparentColor
                }),
                cells: null
            }
        },-1)   

        var ret = {
            container: null,
            currentSector: null,
            _createSector: function (newSectorXLoc, newSectorYLoc) {
                var sector = memoryPool.get('gridSector')
                if (sector != null) {
                    sector.container.parent = this.container
                    sector.container.w = this.container.w
                    sector.container.h =  this.sectorHeight
                    sector.container.x = newSectorXLoc
                    sector.container.y = newSectorYLoc
                }
                return sector
            },
            // Adds a new sector above the current sector
            extendUp: function (relativeSector) {
                var newSectorYLoc = relativeSector.container.y - this.sectorHeight
                relativeSector.top = this._createSector(relativeSector.container.x, newSectorYLoc)
                relativeSector.top.bottom = relativeSector
                return relativeSector.top
            },
            // Adds a new sector below the current sector
            extendDown: function (relativeSector) {
                var newSectorYLoc = relativeSector.container.y + this.sectorHeight
                relativeSector.bottom = this._createSector(relativeSector.container.x, newSectorYLoc)
                relativeSector.bottom.top = relativeSector
                return relativeSector.bottom
            },
            // Adds a new sector to the right of the current sector
            extendRight: function (relativeSector) {
                var newSectorXLoc = relativeSector.container.x + this.container.w
                relativeSector.right = this._createSector(newSectorXLoc, relativeSector.container.y)
                relativeSector.right.left = relativeSector
                return relativeSector.right
            },
            // Adds a new sector to the left of the current sector
            extendLeft: function (relativeSector) {
                var newSectorXLoc = relativeSector.container.x - this.container.w
                relativeSector.left = this._createSector(newSectorXLoc, relativeSector.container.y)
                relativeSector.left.right = relativeSector
                return relativeSector.left
            },
            remove: function(sector){
                if (sector.top != null) {
                    sector.top.bottom = null
                    sector.top = null
                }
                if (sector.bottom != null) {
                    sector.bottom.top = null
                    sector.bottom = null
                }
                if (sector.right != null) {
                    sector.right.left = null
                    sector.right = null
                }
                if (sector.left != null) {
                    sector.left.right = null
                    sector.left = null
                }
                memoryPool.recycle('gridSector',sector)
            },
            // initialize the sectors object
            init: function (parent, borderWidth, sectorHeight) {

                this.container = parent
                this.borderWidth = borderWidth
                this.sectorHeight = sectorHeight
                this.currentSector = this._createSector(0, -1) 

                return this.currentSector
            }
        }

        return ret
    }

}).catch(function (err) {
    console.error("Error on Grid : ")
    console.log(err.stack)
});