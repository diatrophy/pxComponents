
px.import({
  ws:'ws'
}).then(function importsAreReady(imports) {

    var ws = imports.ws

    // requests contents of a dataservice via a websocket
    module.exports =  function(url,websocketUrl) {

        return new Promise(function(resolve,reject) {
        
            console.log("about to try opening ws for url "+url)
            var mySocket = new ws(websocketUrl)
            console.log("done opening ws")
            mySocket.on('open', function() {
                console.log("Received open")
                mySocket.send(url)
            });
            mySocket.on('message', function(message) {
                console.log('received: %s', message)
                mySocket.close()
                resolve( message)
            });
        });
    }
})
