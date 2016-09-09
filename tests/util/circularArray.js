var chai = require('chai'),
    expect = chai.expect, // we are using the "expect" style of Chai
    CircularArray = require('./../../util/circularArray')

var circularArray = new CircularArray([0,1,2,3,4,5,6,7,8,9])     

describe('Circular Array', function() {

    it('slice() should return correct array', function() {


        var ret = circularArray.slice(2,4)

        var expected = [2,3]

        expect(ret.length).equal(expected.length)
        expect(ret).to.include.members(expected)
    });


it('slice() should return correct array', function() {

        var circularArray = new CircularArray([0])     

        var ret = circularArray.slice(5,10)

        var expected = [0]

        expect(ret.length).equal(expected.length)
        expect(ret).to.include.members(expected)
    });

     it('slice() should return correct array for end post length of array', function() {

        var ret = circularArray.slice(9,11)

        var expected = [9,0]

        expect(ret.length).equal(expected.length)
        expect(ret).to.include.members(expected)
    });

    it('slice() should return correct array for end pre length of array', function() {

        var ret = circularArray.slice(-1,1)

        var expected = [9,0]

        expect(ret.length).equal(expected.length)
        expect(ret).to.include.members(expected)
    });

})