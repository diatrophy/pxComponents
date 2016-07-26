
px.import({
  ws:'ws'
}).then(function importsAreReady(imports) {

    var ws = imports.ws

    // TODO - remove in PROD enviroment
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    // requests contents of a dataservice via a websocket
    module.exports =  function(urls,websocketUrl,token) {

        return new Promise(function(resolve,reject) {

            var returnMsg

            console.log("about to try opening ws for url "+urls + " with token - " + token)
            var mySocket = new ws(websocketUrl)

            mySocket.on('open', function() {
                // console.log('recvd open')            // comment out to prevent noise
                if (Array.isArray(urls)) {
                    returnMsg = []
                    for (var k = 0; k < urls.length; k++) {
                        var json = JSON.stringify({url: urls[k], token: token})
                        mySocket.send(json)
                    }
                } else {
                    console.log('single send')
                    var json = JSON.stringify({url: urls, token: token})
                    mySocket.send(json)
                }
            });
            mySocket.on('message', function(message) {
                console.log('received: %s', message) // comment out to prevent noise
                if (returnMsg.length >= 0) {
                    returnMsg.push(message)
                    if (returnMsg.length == urls.length)
                        mySocket.close()
                } else {
                    returnMsg = message
                    mySocket.close()
                }
            });
            mySocket.on('close', function() {
                resolve(returnMsg)
                console.log('closing socket');
            });
        });
    }
}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});

