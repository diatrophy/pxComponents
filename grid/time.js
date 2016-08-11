// time.js
//
//
// This component draws a time-bar at the top of the screen
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
    image           : '../image/image.js',
    timeModel       : './timeModel.js'
}).then(function importsAreReady(imports) {

    var image = imports.image,
        timeModel = imports.timeModel()

    var greyColor = 0x999999ff
    var blue = 0x1E90FFff

    module.exports = function(scene) {

        var DEFAULT_TIME_GROUPS = timeModel.timeRange / timeModel.timeInterval    // There are 5.5 30-minute sectors in the time line.

        var imageRenderer = imports.imageRenderer(scene)

        var weekday = new Array(7);
        weekday[0]=  "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var transparentColor = 0xffffff00

        return {
            
            init    : function(h,parent,xOffset,xOffset2,markerUrl) {

                this.borderWidth = 1
                this.height = h - this.borderWidth
                this.container = parent
                this.xOffset = xOffset == null ? 0 : xOffset            // use over-ride if specified
                this.xOffset2 = xOffset2
                this.markerUrl = markerUrl

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
            registerSelectedFunction : function(func) {

                this.tileSelectedFunction = func
                return this
            },
            // helper function that coverts a time model into cells for use in the time-line
            _convertTimeModelToCells : function(model,sector,timeSectorWidth,timeSectorHeight) {

                var timeCells = [], i = 0, timeOffset= 0
                
                if (model.preOffset > 0) {
                    var w = Math.round(model.preOffset / timeModel.timeInterval * timeSectorWidth)
                    timeOffset = w
                    // if there is an offset - add a placeholder cell (helps tracking)
                    timeCells.push(image({t:'rect',fillColor:transparentColor,parent:sector,a:1,x:0,y:0,w:w,h:timeSectorHeight,
                        data:{date:null}}))
                }

                // loop through all the time ranges and build the time groups
                model.dates.forEach(function(dateOffset){

                    // re-calculate the width if this is the last one in the sector
                    var w = timeSectorWidth
                    if (i == model.dates.length-1 && model.postOffset > 0)
                        w = Math.round(model.postOffset / timeModel.timeInterval * timeSectorWidth)

                    // time line
                    timeCells.push(image({t:'rect',parent:sector,a:1,x:timeOffset,y:0,w:w,h:timeSectorHeight,fillColor:transparentColor,
                        data:{date:dateOffset.date}}))

                    timeOffset += w
                    i++
                })

                return timeCells
            },
            // This private function adds a time sector relative to the given sector
            // if relativeSector is null, this is assumed to be the first sector
            _addSector : function(relativeSector) {

                var t = this

                var timeDataModel, sectorXOffset = 0

                if (relativeSector != null) {
                    sectorXOffset = relativeSector.container.x + this.width
                    var nextStartOffset = timeModel.getNextStartDateOffset(relativeSector.model)
                    timeDataModel = timeModel.getTimeModelForStartTime(nextStartOffset.startDate, nextStartOffset.offset)
                } else {
                    timeDataModel = timeModel.getInitialTimeModel()
                    var midnight = new Date(timeDataModel.startDate.getTime())
                    midnight.setDate(midnight.getDate()+1)
                    midnight.setHours(0)
                    midnight.setMinutes(0)
                    midnight.setMilliseconds(0)
                    this.midnight = midnight
                }

                // create the container for the time line of this sector
                var sector = scene.create({t:'rect',parent:this.timeContainer,x:sectorXOffset,y:0,a:1,fillColor:transparentColor,
                    w:this.width,h:this.timeContainer.h})

                var timeCells = t._convertTimeModelToCells(timeDataModel,sector,this.timeSectorWidth,this.container.h)

                if (relativeSector == null)
                    timeCells[0].config.data.first = true

                // render the time cells
                imageRenderer.renderList(timeCells,function(timeTile){

                    var timeText = ""
                    var startDate = timeTile.config.data.date

                    if (startDate.getTime() >= t.midnight.getTime()) {
                        timeText += weekday[startDate.getDay()] + " "
                    }

                    var hr = startDate.getHours() > 12 || startDate.getHours() == 0 ? Math.abs(startDate.getHours() - 12) : startDate.getHours()
                    var suffix = startDate.getHours() >= 12 ? "p" : "a"

                    var min = startDate.getMinutes() == 0 ? "00" : startDate.getMinutes()
                    // TODO - add code that adds day if around midnight hour
                    // TODO - pass time to function, and let callee decide how to render

                    timeText += hr + ":" + min + suffix
                    t.tileRenderFunction(timeTile, timeText)

                },function(){
                    // do nothing post rendering
                })

                return {container:sector,model:timeDataModel,cells:timeCells}
            },
            // initial rendering of the selector
            render  : function() {

                // create the parent container for all the time sectors
                var width = this.timeSectorWidth *  DEFAULT_TIME_GROUPS
                var c = scene.create({t:'rect',parent:this.container,x:this.xOffset,y:0,h:this.container.h,w:width,clip:true,fillColor:transparentColor,})
                this.timeContainer = scene.create({t:'rect',parent:c,x:0,y:0,h:c.h,w:c.w,fillColor:transparentColor})     // this is the container that scrolls

                // add the current sector and the one next to it
                this.currentSector = this._addSector(null)
                this.addRightSector()

                // horizontal line
                scene.create({
                    t: 'rect',
                    parent: this.container,
                    x: this.xOffset2,
                    y: this.container.h-1,
                    w: this.container.w,
                    h: 1,
                    fillColor: greyColor
                })

                // horizontal line
                scene.create({
                    t: 'rect',
                    parent: this.container,
                    x: this.xOffset2,
                    y: 0,
                    w: this.container.w,
                    h: 1,
                    fillColor: greyColor
                })

                var now = new Date()
                var min = now.getMinutes()
                if (min > 30)
                    min = min - 30
                var timeMarkW  = min * this.timeSectorWidth / (timeModel.timeInterval * 60)

                // time marker line
                scene.create({
                    t: 'rect',
                    parent: this.currentSector.container,
                    x: 0,
                    y: this.container.h-3,
                    w: timeMarkW,
                    h: 2,
                    fillColor: blue
                })

                // pointer that marks the current time
                scene.create({
                    t:'image',
                    url:this.markerUrl,
                    parent: this.currentSector.container,
                    x: timeMarkW - 18,
                    y: this.container.h-20-10,
                })
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
            update : function(date) {
                var cells = this.currentSector.cells
                cells.forEach(function(cell){
                    // console.log(cell.config.data.date)
                    // console.log(cell)
                    // TODO  - highlight the currently selected time in the time sector
                })
            }
        }
    }
}).catch( function(err){
    console.error("Error on Time selector: ")
    console.log(err)
});
