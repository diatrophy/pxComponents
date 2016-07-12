// screen.js


module.exports = function() { 

    //  public methods
    return {
        // returns a random int
        getScreenW   : function(s) {
            if (s == 720)
                return 1280
            else if (s == 1080)
                return 1920
            else 
                return null
        },
        getScreenH   : function(s) {
            if (s == 720)
                return 720
            else if (s == 1080)
                return 1080
            else 
                return null        },
    }
}
