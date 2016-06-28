// returns whatever you tell it to return
px.import({
  constants:'../pxMath.js',
  ws:'ws'
}).then(function importsAreReady(imports) {

    var constants = imports.constants,
        ws = imports.ws

    module.exports =  function(response) {

        var promise = new Promise(function(resolve,reject) {
            resolve(response)
        });

        return promise;
    }
})
