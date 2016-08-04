// time.js
//
//
// This component draws a timebar at the top of the screen
//
// 1:00                1:30                  2:00                  2:30                  3:00                  3:30
//
// +---------+---------+---------+---------+----------+----------+----------+----------+----------+----------+----------+
// |         |         |         |         |          |          |          |          |          |          |          |
// |         |         |         |         |          |          |          |          |          |          |          |
// |         |         |         |         |          |          |          |          |          |          |          |
// |         |         |         |         |          |          |          |          |          |          |          |
// +---------+---------+---------+---------+----------+----------+----------+----------+----------+----------+----------+

// Jason Coelho

px.import({
    imageRenderer   : '../image/imageRenderer.js',
    image           : '../image/image.js'
}).then(function importsAreReady(imports) {

    var image = imports.image
     
    module.exports = function(scene) {

        var DEFAULT_TIME_RANGE  = 2.75                                  // For each sector the time-line manages 2 hours and 45 minutes
        var TIME_INTERVAL = 0.50                                        // each interval is half an hour
        var DEFAULT_TIME_GROUPS = DEFAULT_TIME_RANGE / TIME_INTERVAL    // There are 5.5 30-minute sectors in the time line.

        var imageRenderer = imports.imageRenderer(scene)

        return {
            
            init    : function(h,parent,xOffset) {

                this.borderWidth = 1
                this.height = h - this.borderWidth
                this.container = parent
                this.xOffset = xOffset == null ? 0 : xOffset            // use over-ride if specified

                // determine each time group width based on the container width and offset
                this.timeSectorWidth = Math.round((this.container.w - this.xOffset) / DEFAULT_TIME_GROUPS)
                this.width = this.timeSectorWidth *  DEFAULT_TIME_GROUPS

                return this
            },
            // we register rendering action here for each individual tile
            registerTileRenderFunction : function(func) {

                this.tileRenderFunction = func
                return this
            },
            // This private function adds a time sector relative to the given sector
            _addSector : function(relativeSector) {

                // if null, this is a first sector and offset is zero, otherwise it needs to be off-setted

                var t = this
                var startDate = new Date()                                      // default time is NOW
                if ( relativeSector != null) {
                    // if there is a relative sector, the time line begins where the previous one ended
                    // 15 minutes are added to take into account the prev sector ending post 15-minutes
                    if (relativeSector.partialTime == 0)
                        startDate = relativeSector.endDate
                    else
                        startDate = new Date(relativeSector.endDate.getTime()+( (TIME_INTERVAL - relativeSector.partialTime) * 60*60*1000))

                } else {
                    var min = startDate.getMinutes() < 30 ? 0 : 30              // initialize the time at top of the hour
                    startDate.setMinutes(min)                                   // or half hour mark
                    startDate.setSeconds(0)
                    startDate.setMilliseconds(0)
                }

                var dateOffset = startDate                                      // date counter

                var sectorXOffset = 0
                if (relativeSector != null && relativeSector.partialTime != 0) {
                    // if adjoining another sector, the offset (width) is half the regular cell
                    var offset = ((TIME_INTERVAL - relativeSector.partialTime) * this.timeSectorWidth / TIME_INTERVAL)
                    sectorXOffset = relativeSector.container.x + this.width + offset
                }

                // create the container for the time line of this sector
                var sector = scene.create({t:'rect',parent:this.timeContainer,x:sectorXOffset,y:0,a:1,
                    w:this.width,h:this.timeContainer.h})

                var timeCells = []
                var i = 0
                var partialTime = 0
                var timeOffset = 0

                // loop through all the time ranges and build the time groups
                while (i < DEFAULT_TIME_RANGE) {

                    // if tile is the last one and there is an expected overlap (remainder modulus), we
                    // recalculate the tile width, otherwise it default to the time sector width
                    var tileWidth = this.timeSectorWidth
                    if (i + TIME_INTERVAL > DEFAULT_TIME_RANGE) {
                        var remainderTimeModulus = DEFAULT_TIME_RANGE % i
                        if (remainderTimeModulus > 0 && remainderTimeModulus < TIME_INTERVAL) {
                            tileWidth = Math.round(remainderTimeModulus * this.timeSectorWidth / TIME_INTERVAL)
                            partialTime = remainderTimeModulus
                        }
                    }

                    // time line
                    timeCells.push(image({t:'rect',parent:sector,a:1,
                        x:timeOffset,
                        y:0,
                        w:tileWidth,
                        h:this.container.h,
                        data:{date:dateOffset}}))

                    // increment the date offset with the partial time if this is the last cell,
                    // otherwise increment it with the TIME_INTERVAL
                    if (partialTime == 0)
                        dateOffset = new Date(dateOffset.getTime()+((TIME_INTERVAL * 60)*60*1000));   // add time interval to the previous time
                    else
                        dateOffset = new Date(dateOffset.getTime()+((partialTime * 60)*60*1000));

                    timeOffset += tileWidth - this.borderWidth

                    i += TIME_INTERVAL
                }

                // render the time cells
                imageRenderer.renderList(timeCells,function(timeTile){

                    var startDate = timeTile.config.data.date
                    var hr = startDate.getHours() > 12 ? startDate.getHours() - 12 : startDate.getHours()
                    var suffix = startDate.getHours() > 12 ? " pm" : ""
                    var min = startDate.getMinutes() == 0 ? "00" : startDate.getMinutes()
                    // TODO - add code that adds day if around midnight hour
                    // TODO - pass time to function, and let callee decide how to render
                    var timeText = hr + ":" + min + suffix
                    t.tileRenderFunction(timeTile, timeText)

                },function(){
                    // do nothing post rendering
                })

                var endDate = new Date(dateOffset.getTime())

                return {container:sector,endDate:endDate,startDate:startDate,partialTime:partialTime}
            },
            // initial rendering of the selector
            render  : function() {

                // create the parent container for all the time sectors
                var width = this.timeSectorWidth *  DEFAULT_TIME_GROUPS
                var c = scene.create({t:'rect',parent:this.container,x:this.xOffset,y:0,h:this.container.h,w:width,clip:true})
                this.timeContainer = scene.create({t:'rect',parent:c,x:0,y:0,h:c.h,w:c.w})     // this is the container that scrolls

                // add the current sector and the one next to it
                this.currentSector = this._addSector(null)
                this.addRightSector()
            },
            // adds a sector to the right of the current sector
            addRightSector : function(){
                if (this.currentSector.right == null) {
                    var right = this._addSector(this.currentSector)
                    right.left = this.currentSector
                    this.currentSector.right = right
                }
            },
            // handles updating the location of the selector
            update : function() {

            }
        }
    }
}).catch( function(err){
    console.error("Error on Time selector: ")
    console.log(err)
});
