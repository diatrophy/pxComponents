'use strict'

module.exports = function() {

    var DEFAULT_TIME_RANGE  = 2.75,                                 // For each sector the time-line manages 2 hours and 45 minutes
        TIME_INTERVAL = 0.50,                                       // each interval is half an hour
        HOUR_MILLISECONDS = 1000 * 60 * 60,
        TIME_INTERVAL_MILLIS = HOUR_MILLISECONDS * TIME_INTERVAL

    return {
        timeInterval : TIME_INTERVAL,
        timeRange : DEFAULT_TIME_RANGE,
        // returns a model containing a list of 'displayable' dates beginning with startTime. An offset determines how many
        // of these dates will actually fit into a model (depending on the DEFAULT_TIME_RANGE), and also determines
        // the model's start and end date
        getTimeModelForStartTime : function(startTime,offset){

            if (offset == null)
                offset = 0

            if (startTime == null)
                return []

            var dates = [],
                d = startTime,
                i = 0

            if (offset != null && offset != 0)
                i+= offset

            while (i<DEFAULT_TIME_RANGE){

                var t = {date:d}
                dates.push(t)

                i+= TIME_INTERVAL

                if (i<=DEFAULT_TIME_RANGE)
                    d = new Date(d.getTime() + TIME_INTERVAL_MILLIS)
            }

            var postOffset = i - DEFAULT_TIME_RANGE                 // this is how much time is left over

            if (postOffset > 0)                                     // if it is over 0, we use it to calculate the end date of this model
                d = new Date(d.getTime() + HOUR_MILLISECONDS * postOffset)

            if (offset)                                             // if there was an offset, the start date of this model should begin there
                startTime = new Date(startTime.getTime() - 1000*60*60*offset)

            return {dates:dates,preOffset:offset,postOffset:postOffset,startDate:startTime,endDate:d}

        },
        // helper function to determine the next start date and offset based on an end date and post offset
        getNextStartDateOffset: function(timeModel) {

            var endDate = timeModel.dates[timeModel.dates.length-1]
            var startDate = new Date(endDate.date.getTime() + TIME_INTERVAL_MILLIS)
            var offset = 0
            if (timeModel.postOffset != null && timeModel.postOffset != 0)
                offset = TIME_INTERVAL - timeModel.postOffset

            return {startDate:startDate,offset:offset}
        },
        // returns the time model with the default start date as NOW
        getInitialTimeModel : function() {

            var startDate = this.getStartDate(new Date())
            return this.getTimeModelForStartTime(startDate,null)
        },
        // normalizes the start date so that it starts at either the top of the hour or at the 30 minutes
        getStartDate : function(date) {

            var min = date.getMinutes() < 30 ? 0 : 30              // initialize the time at top of the hour
            date.setMinutes(min)                                   // or half hour mark
            date.setSeconds(0)
            date.setMilliseconds(0)
            return date
        },
        // get the total number of group in the time model
        getGroupSize : function(){
            return Math.round(DEFAULT_TIME_RANGE / TIME_INTERVAL)
        }

    }
}