# pxComponents

A framework for creating components using *pxscene*

# GETTING STARTED WITH PXSCENE REFERENCE SAMPLES

- Clone PxScene Project from Github

    git clone https://github.com/johnrobinsn/pxscene.git

- Caveat : The actual pxscene files aren't in the master branch as this is a Github Pages project. So you will need to checkout the `gh-pages` branch.

    git checkout gh-pages

# HTTP SERVER

- PxScene reference samples need to be served via an http server
- When testing or iterating locally, you can run your own http server to server `js` files

    npm install http-server -g
    cd pxscene/examples/px-reference/gallery
    http-server

- All contents of the folder will now be exposed locally and on the network

    http:127.0.0.1:8080
    http:10.36.XXX.XXX:8080

# pxComponents

- I am placing all commonly used library functions in here so that they can be reused
- To use this library, I will stand up a local http at 8090 and serve content

# Common Documentation locations -

- http://johnrobinsn.github.io/pxScene2d/docs/

# Helpful Tips

- use the try-catch statement in javascript when debugging errors - especially in promises.
