// Commonly used Math functions 

module.exports = function() { 

    //  public methods
    return {

        // returns a random int
        randomInt   : function(r1, r2) {
            return Math.round(Math.random()* (r1 - r2) + r2)
        },
        randomIntFromList : function(li) {
            return li[this.randomInt(0,li.length-1)]
        },
        // gfx clamp function
        clamp       : function(v,minVal,maxVal) {
            return this.min(maxVal,this.max(minVal,v))
        },
        min         : function(v1,v2) {
            return (v1 < v2)?v1:v2;
        },
        max          : function(v1,v2) {
            return (v1 > v2)?v1:v2;
        }
    }
}
