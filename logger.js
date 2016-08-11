// Commonly used Math functions

module.exports = function(sourceName) {

    //  public methods
    return {

        // returns a random int
        log   : function(message) {
            var date = new Date()
            console.log(date +" - pxComponents [" + sourceName + "] " + message)
        }
    }
}
