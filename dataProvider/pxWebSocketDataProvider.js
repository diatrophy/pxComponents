
px.import({
  constants:'../pxMath.js',
  ws:'ws'
}).then(function importsAreReady(imports) {

    var constants = imports.constants,
        ws = imports.ws

    module.exports =  function(url,dataService) {

        var promise = new Promise(function(resolve,reject) {
        
            console.log("about to try opening ws for url "+url);
            var mySocket = new ws(dataService); //('ws://'+dataService+'/websocket');//':8080/websocket');
            console.log("done opening ws");
            mySocket.on('open', function() {
              console.log("Received open");
                mySocket.send(url);
            });
            mySocket.on('message', function(message) {
                console.log('received: %s', message);
                mySocket.close();
                resolve( message);
            });
        });

        return promise;
    }
})
