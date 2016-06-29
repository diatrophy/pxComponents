// returns whatever you tell it to return

module.exports =  function(response) {

    return new Promise(function(resolve,reject) {
        resolve(response)
    })
}

