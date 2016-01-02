#Jwt authorisation with NodeJs and RxJs

The node server is from [this tutorial](https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens)
It is extended with a client that is driven by RxJs

##Prerequisites

Make sure you have installed

* Webpack
* mongodb
* Node

##Use

    npm install
    mongod --dbpath db
    nodemon server.js
    npm start
   
   
Make a rest call to /setup as described in the tutorial.Node server is running on port 8081 to avoid
conflicts with webpack dev server.
 
The client is served with webpack on http://localhost:8080/webpack-dev-server/index.html