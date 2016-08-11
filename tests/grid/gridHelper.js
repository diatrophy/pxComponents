var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect; // we are using the "expect" style of Chai
var GridHelper = require('./../../grid/gridHelper');
var gridHelper = new GridHelper([]);

describe('GridHelper', function() {

    it('getTimeModelForStartTime() should return empty array if null is passed in', function () {

        var cells = gridHelper.convertListingDataInViewToCells([
                [
                    { i: '1001841108090230109', t: 'Fameless', s: 1470709800000, e: 1470711660000,
                        next: '1001841108090301109', p: 18.787878787878785 },
                    { i: '1001841108090301109', t: 'Comedy Knockout', s: 1470711660000, e: 1470713460000,
                        prev: '1001841108090230109', next: '1001841108090331109', p: 18.181818181818183 },
                    { i: '1001841108090331109', t: 'Comedy Knockout', s: 1470713460000, e: 1470715320000,
                        prev: '1001841108090301109', next: '1001841108090402109', p: 18.787878787878785 },
                    { i: '1001841108090402109',t: 'Impractical Jokers', s: 1470715320000, e: 1470717120000,
                        prev: '1001841108090331109', next: '1001841108090432109', p: 18.181818181818183 },
                    { i: '1001841108090432109', t: 'Impractical Jokers',s: 1470717120000,e: 1470718920000,
                        prev: '1001841108090402109',next: '1001841108090502109',p: 18.181818181818183 },
                    { i: '1001841108090502109', t: 'Impractical Jokers',s: 1470718920000, e: 1470720660000,
                        prev: '1001841108090432109', next: '1001841108090531109', p: 17.575757575757574 }
                ],
                [
                    { i: '1001841108090230109', t: 'Fameless', s: 1470709800000, e: 1470711660000,
                        next: '1001841108090301109', p: 18.787878787878785 },
                    { i: '1001841108090301109', t: 'Comedy Knockout', s: 1470711660000, e: 1470713460000,
                        prev: '1001841108090230109', next: '1001841108090331109', p: 18.181818181818183 },
                    { i: '1001841108090331109', t: 'Comedy Knockout', s: 1470713460000, e: 1470715320000,
                        prev: '1001841108090301109', next: '1001841108090402109', p: 18.787878787878785 },
                    { i: '1001841108090402109',t: 'Impractical Jokers', s: 1470715320000, e: 1470717120000,
                        prev: '1001841108090331109', next: '1001841108090432109', p: 18.181818181818183 },
                    { i: '1001841108090432109', t: 'Impractical Jokers',s: 1470717120000,e: 1470718920000,
                        prev: '1001841108090402109',next: '1001841108090502109',p: 18.181818181818183 },
                    { i: '1001841108090502109', t: 'Impractical Jokers',s: 1470718920000, e: 1470720660000,
                        prev: '1001841108090432109', next: '1001841108090531109', p: 17.575757575757574 }
                ]
            ]
            ,{container:'container'},100,10,
            function(){
                return {
                //    container,alpha,xOffset,yOffset,wid,tileH,cellData
                    container:arguments[0],
                    alpha:arguments[1],
                    xOffset:arguments[2],
                    yOffset:arguments[3],
                    wid:arguments[4],
                    tileH:arguments[5],
                    cellData:arguments[6]
                }
        })

        console.log(cells)

        expect(cells.length).to.equal(12);

        var a1 = [0,1,2,3,4,5]
        a1.forEach(function(index){
            expect(cells[index].yOffset).to.equal(1)
        })

        var a2 = [6,7,8,9,10,11]
        a2.forEach(function(index){
            expect(cells[index].yOffset).to.equal(11)
        })
    })

    it('calculateCellWidth() should cell width if within view port at offset', function () {

        var width = gridHelper.calculateCellWidth({container :{w:20,x:30}},30)
        expect(width).to.equal(20)
    })

    it('calculateCellWidth() should cell width if within view port past offset', function () {

        var width = gridHelper.calculateCellWidth({container :{w:20,x:50}},30)
        expect(width).to.equal(20)
    })

    it('calculateCellWidth() should adjust cell width if left obscured', function () {

        var width = gridHelper.calculateCellWidth({container :{w:20,x:20}},30)
        expect(width).to.equal(10)
    })

    it('calculateCellWidth() should adjust cell width if left obscured 2', function () {

        var width = gridHelper.calculateCellWidth({container :{w:50,x:-10}},30)
        expect(width).to.equal(10)
    })

    it('calculateNumberOfCellBuckets() should return correct value', function () {

        var buckets = gridHelper.calculateNumberOfCellBuckets(90)
        expect(buckets).to.equal(45)
    })

    it('calculateNumberOfCellBuckets() should return correct value with negative offset', function () {

        var buckets = gridHelper.calculateNumberOfCellBuckets(90,-40)
        expect(buckets).to.equal(25)
    })

})