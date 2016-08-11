var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect; // we are using the "expect" style of Chai
var TimeModel = require('./../../grid/timeModel');
var timeModel = new TimeModel([]);

describe('Time', function() {

    it('getTimeModelForStartTime() should return empty array if null is passed in', function() {
        expect(timeModel.getTimeModelForStartTime().length).to.equal(0);
    });

    it('getTimeModelForStartTime() should return correct array if startTime is passed in', function() {

        var startTime = new Date(1470373200000)     // 1:00 am

        var model = timeModel.getTimeModelForStartTime(startTime)
        var dates = model.dates
        expect(dates.length).to.equal(timeModel.getGroupSize());

        expect(dates[0]).to.have.property('date').equalTime(new Date(1470373200000)) // 1am
        expect(dates[1]).to.have.property('date').equalTime(new Date(1470375000000)) // 1:30am
        expect(dates[2]).to.have.property('date').equalTime(new Date(1470376800000)) // 2:00am
        expect(dates[3]).to.have.property('date').equalTime(new Date(1470378600000)) // 2:30am
        expect(dates[4]).to.have.property('date').equalTime(new Date(1470380400000)) // 3:00am
        expect(dates[5]).to.have.property('date').equalTime(new Date(1470382200000)) // 3:30am

        expect(model.postOffset).equal(0.25)
        expect(model.startDate).equalTime(new Date(1470373200000))  // 1am
        expect(model.endDate).equalTime(new Date(1470383100000))    // 3:45am

    });

    it('getTimeModelForStartTime() should return correct array if startTime and offset is passed in', function() {

        var startTime = new Date(1470373200000)     // 1:00 am

        var model = timeModel.getTimeModelForStartTime(startTime,0.25)
        var dates = model.dates
        expect(dates.length).to.equal(timeModel.getGroupSize() - 1);

        expect(dates[0]).to.have.property('date').equalTime(new Date(1470373200000)) // 1am
        expect(dates[1]).to.have.property('date').equalTime(new Date(1470375000000)) // 1:30am
        expect(dates[2]).to.have.property('date').equalTime(new Date(1470376800000)) // 2:00am
        expect(dates[3]).to.have.property('date').equalTime(new Date(1470378600000)) // 2:30am
        expect(dates[4]).to.have.property('date').equalTime(new Date(1470380400000)) // 3:00am

        expect(model.postOffset).equal(0)
        expect(model.startDate).equalTime(new Date(1470372300000))  // 12:15am
        expect(model.endDate).equalTime(new Date(1470382200000))    // 3:30am

    });

    it('getStartDate() should return correct date', function() {

        var date = new Date()
        var startDate = timeModel.getStartDate(date);

        var min = date.getMinutes()< 30 ? 0 : 30
        date.setMinutes(min)
        date.setSeconds(0)
        date.setMilliseconds(0)

        expect(startDate).equalTime(date);

    });

    it('getInitialTimeModel() should return correct array', function() {

        var model = timeModel.getInitialTimeModel()
        var dates = model.dates
        expect(dates.length).to.equal(timeModel.getGroupSize());

        var expectedFirstStartDate = timeModel.getStartDate(new Date()) // it's ok, getStartDate tested above

        expect(dates[0]).to.have.property('date').equalTime(expectedFirstStartDate) // start Date
        expect(dates[1]).to.have.property('date').equalTime(new Date(expectedFirstStartDate.getTime()+30*60*1000)) // + 30 min
        expect(dates[2]).to.have.property('date').equalTime(new Date(expectedFirstStartDate.getTime()+60*60*1000)) // + 1 hr
        expect(dates[3]).to.have.property('date').equalTime(new Date(expectedFirstStartDate.getTime()+90*60*1000)) // + 1 hr 30 min
        expect(dates[4]).to.have.property('date').equalTime(new Date(expectedFirstStartDate.getTime()+120*60*1000)) // + 2 hr
        expect(dates[5]).to.have.property('date').equalTime(new Date(expectedFirstStartDate.getTime()+150*60*1000)) // + 2 hr 30 min


        expect(model.postOffset).equal(0.25)
        expect(model.startDate).equalTime(expectedFirstStartDate)  // start Date

        expect(model.endDate).equalTime(new Date(expectedFirstStartDate.getTime()+165*60*1000))    // start Date  + 2 hr 45 min

    });

    it('getNextStartDateOffset() should return correct start date and offset for a model', function() {

        var startTime = new Date(1470373200000)     // 1:00 am

        var expectedNextStartTime = new Date(startTime.getTime() + 60*60*1000 * 3) // expect the next start time to be 3 hrs from 1

        var model = timeModel.getTimeModelForStartTime(startTime,0)

        var nextStartOffset = timeModel.getNextStartDateOffset(model)
        expect(nextStartOffset.startDate).equalTime(expectedNextStartTime)
        expect(nextStartOffset.offset).equal(0.25)

    });

    it('getNextStartDateOffset() should return correct start date and offset for a model with offset', function() {

        var startTime = new Date(1470373200000)     // 1:00 am

        var expectedNextStartTime = new Date(startTime.getTime() + 60*60*1000 * 2.50) // expect the next start time to be 3 hrs from 1

        var model = timeModel.getTimeModelForStartTime(startTime,0.25)

        var nextStartOffset = timeModel.getNextStartDateOffset(model)
        expect(nextStartOffset.startDate).equalTime(expectedNextStartTime)
        expect(nextStartOffset.offset).equal(0)

    });

});