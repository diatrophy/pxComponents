// Loads content from http
//
// TODO - would preferably use http module if allowed rather than pxArchive
//
// Jason Coelho

px.import({
    scene:"px:scene.1.js"
}).then(function importsAreReady(imports) {

    var scene = imports.scene;

    // requests contents of a dataservice via a websocket
    module.exports =  function(requests){

        return new Promise(function(resolve,reject) {

            if (Array.isArray(requests)) {

                console.log("about to try opening http for url "+requests)

                var promises = []

                returnMsg = []

                for (var k = 0; k < requests.length; k++) {
                    promises.push(scene.loadArchive(requests[k]).ready)
                }

                Promise.all(promises).then(function(response){
                    resolve(response)
                })

            } else {
                console.log('single send - ' + requests)
                var archiveFile = scene.loadArchive(requests);
                archiveFile.ready.then(function (response) {
                    resolve(archiveFile.getFileAsString(requests))
                })
            }
        })
    }
}).catch( function(err){
    console.error("Error on Grid : ")
    console.log(err)
});



