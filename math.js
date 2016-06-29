// Commonly used Math functions 

module.exports = function() { 

    //  public methods
    return {

        // returns a random int
        randomInt   : function(r1, r2) {
            return Math.round(Math.random()* (r1 - r2) + r2)
        }

    }
}
