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
    imageRenderer: '../image/imageRenderer.js',
    image: '../image/image.js',
    timeModel: './timeModel.js',
    logger: '../logger.js'
}).then(function importsAreReady(imports) {

    var image = imports.image,
        timeModel = imports.timeModel(),
        logger = imports.logger()

    var greyColor = 0x999999ff
    var blue = 0x1E90FFff

    module.exports = function (scene) {

        var DEFAULT_TIME_GROUPS = timeModel.timeRange / timeModel.timeInterval    // There are 5.5 30-minute sectors in the time line.

        var imageRenderer = imports.imageRenderer(scene)

        var weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var transparentColor = 0xffffff00

        return {

            init: function (h, parent, xOffset, xOffset2, markerUrl) {

                this.borderWidth = 1
                this.height = h - this.borderWidth
                this.container = parent
                this.xOffset = xOffset == null ? 0 : xOffset            // use over-ride if specified
                this.xOffset2 = xOffset2
                this.markerUrl = markerUrl

                var w = this.container.w - xOffset,
                    min = ((2 * 60) + 45)

                // determine each time group width based on the container width and offset
                this.minWidth = Math.round( w / min )
                this.width = min * this.minWidth

                this.timeSectorWidth = 30 * this.minWidth

                return this
            },
            // we register rendering action here for each individual tile
            registerTileRenderFunction: function (func) {

                this.tileRenderFunction = func
                return this
            },
            registerSelectedFunction: function (func) {

                this.tileSelectedFunction = func
                return this
            },
            // helper function that coverts a time model into cells for use in the time-line
            _convertTimeModelToCells: function (model, sector, timeSectorWidth, timeSectorHeight) {

                var timeCells = [], i = 0, timeOffset = 0

                var t = this

                if (model.preOffset > 0) {
                    var w = model.preOffset * 60 * t.minWidth
                    timeOffset = w
                    // if there is an offset - add a placeholder cell (helps tracking)
                    timeCells.push(image({
                        t: 'rect',
                        fillColor: transparentColor,
                        parent: sector,
                        a: 1,
                        x: 0,
                        y: 0,
                        w: w,
                        h: timeSectorHeight,
                        data: {date: null}
                    }))
                }

                // loop through all the time ranges and build the time groups
                model.dates.forEach(function (dateOffset) {

                    // re-calculate the width if this is the last one in the sector
                    var w = timeSectorWidth
                    if (i == model.dates.length - 1 && model.postOffset > 0)
                        w = model.postOffset * 60 * t.minWidth

                    // time line
                    timeCells.push(image({
                        t: 'rect',
                        parent: sector,
                        a: 1,
                        x: timeOffset,
                        y: 0,
                        w: w,
                        h: timeSectorHeight,
                        fillColor: transparentColor,
                        data: {date: dateOffset.date}
                    }))

                    timeOffset += w
                    i++
                })

                return timeCells
            },
            friendlyDate: function (d) {
                var hour = d.getHours() > 12 || d.getHours() == 0 ? Math.abs(12 - d.getHours()) : d.getHours()
                var min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
                var suffix = d.getHours() >= 12 ? "p" : "a"
                return hour + ":" + min + suffix
            },
            // This private function adds a time sector relative to the given sector
            // if relativeSector is null, this is assumed to be the first sector
            _addSector: function (relativeSector) {

                var t = this

                var timeDataModel, sectorXOffset = 0

                if (relativeSector != null) {
                    sectorXOffset = relativeSector.container.x + this.width
                    var nextStartOffset = timeModel.getNextStartDateOffset(relativeSector.model)
                    timeDataModel = timeModel.getTimeModelForStartTime(nextStartOffset.startDate, nextStartOffset.offset)
                } else {
                    timeDataModel = timeModel.getInitialTimeModel()
                    var midnight = new Date(timeDataModel.startDate.getTime())
                    midnight.setDate(midnight.getDate() + 1)
                    midnight.setHours(0)
                    midnight.setMinutes(0)
                    midnight.setMilliseconds(0)
                    this.midnight = midnight
                }

                // create the container for the time line of this sector
                var sector = scene.create({
                    t: 'rect', parent: this.timeContainer, x: sectorXOffset, y: 0, a: 1, fillColor: transparentColor,
                    w: this.width, h: this.timeContainer.h
                })

                var timeCells = t._convertTimeModelToCells(timeDataModel, sector, this.timeSectorWidth, this.container.h)

                if (relativeSector == null) {
                    timeCells[0].config.data.first = true
                    t.currentCell = timeCells[0]                
                }

                // render the time cells
                imageRenderer.renderList(timeCells, function (timeTile) {

                    var timeText = ""
                    var startDate = timeTile.config.data.date

                    // code that adds day if around midnight hour
                    if (startDate.getTime() >= t.midnight.getTime()) {
                        timeText += weekday[startDate.getDay()] + " "
                    }

                    timeText += t.friendlyDate(startDate)

                    t.tileRenderFunction(timeTile, timeText)

                    if (timeTile.config.data.first == true) {
                        t.tileSelectedFunction(timeTile,null)
                        t.currentCell = timeTile
                    }

                })

                return {container: sector, model: timeDataModel, cells: timeCells}
            },
            // initial rendering of the selector
            render: function () {

                // create the parent container for all the time sectors
                var width = this.timeSectorWidth * DEFAULT_TIME_GROUPS
                var c = scene.create({
                    t: 'rect',
                    parent: this.container,
                    x: this.xOffset,
                    y: 0,
                    h: this.container.h,
                    w: width,
                    clip: true,
                    fillColor: transparentColor,
                })

                // this is the container that scrolls
                this.timeContainer = scene.create({
                    t: 'rect',
                    parent: c,
                    x: 0,
                    y: 0,
                    h: c.h,
                    w: c.w,
                    fillColor: transparentColor
                })

                // add the current sector and the one next to it
                this.currentSector = this._addSector(null)
                this.addRightSector()

                // horizontal line (bottom)
                scene.create({
                    t: 'rect',
                    parent: this.container,
                    x: this.xOffset2,
                    y: this.container.h - 1,
                    w: this.container.w,
                    h: 1,
                    fillColor: greyColor
                })

                // horizontal line (top)
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
                var timeMarkW = min * this.timeSectorWidth / (timeModel.timeInterval * 60)

                // time marker line
                scene.create({
                    t: 'rect',
                    parent: this.currentSector.container,
                    x: 0,
                    y: this.container.h - 3,
                    w: timeMarkW,
                    h: 2,
                    fillColor: blue
                })

                // pointer that marks the current time
                scene.create({
                    t: 'image',
                    url: this.markerUrl,
                    parent: this.currentSector.container,
                    x: timeMarkW - 18,
                    y: this.container.h - 20 - 10,
                })
            },
            // adds a sector to the right of the current sector
            addRightSector: function () {
                if (this.currentSector.right == null) {
                    var right = this._addSector(this.currentSector)
                    right.left = this.currentSector
                    this.currentSector.right = right
                }
            },
            // handles updating the location of the selector
            update: function (targetDate) {

                var cells = this.currentSector.cells
                var candidate
                for (var i = 0; i < cells.length; i++) {
                    var cell = cells[i]
                    var cellDate = cell.config.data.date 

                    if (cellDate != null) {                                 // in case this is a placeholder cell
                        if (targetDate < cellDate.getTime() && i == 0) {    // if this is the first cell of this sector
                            candidate = cell
                            break
                        } else {
                            if (targetDate >= cellDate.getTime())
                                candidate = cell
                            else if (targetDate < cellDate.getTime()) {
                                break
                            }
                        }
                    }   
                }
                if (candidate != null) {
                    var prevDate = null
                    if (this.currentCell != null) {
                        this.prevCell = this.currentCell
                        prevDate = this.prevCell.config.data.date
                    }
                    this.currentCell = candidate
                    var currentDate = this.currentCell.config.data.date

                    if (prevDate != currentDate)
                        this.tileSelectedFunction(this.currentCell,this.prevCell)
                }

            }
        }
    }
}).catch(function (err) {
    console.error("Error on Time selector: ")
    console.log(err.stack)
});
