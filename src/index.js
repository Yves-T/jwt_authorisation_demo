var Rx = require('rx/dist/rx.all');
var $ = require('jquery');

var showUserButton = document.querySelector('#showUser-button');
var showUserClickStream = Rx.Observable.fromEvent(showUserButton, 'click');
var loginButton = document.querySelector('#login-button');
var loginClickStream = Rx.Observable.fromEvent(loginButton, 'click');

Rx.Observable.prototype.authenticated = function (route) {

    var jwt = localStorage.getItem('id_token');

    // Return the JWT if it exists
    if (jwt != undefined && jwt != null) {
        return this.map(function () {
            return {
                route: route,
                jwt: jwt
            }
        });
    }
    // If there is no JWT, throw an error
    else return Rx.Observable.throw(new Error('No JWT in Local Storage!'));
};

var showUserStream = showUserClickStream.authenticated('http://localhost:8081/api/users');


var showUserResponseStream = showUserStream.flatMap((request) => {
    return fetchUsers(request);
});

var domUsers = showUserResponseStream.flatMap((response) => {
    return response.map((user) => {
        var liTag = document.createElement('li');
        var textNode = document.createTextNode(user.name);
        liTag.appendChild(textNode);
        return liTag;
    });
});

function fetchUsers(request) {
    // We just need to check whether a JWT was sent in as part of the
    // config object. If it was, we'll include it as an Authorization header
    if (request.jwt) {
        var config = {
            url: request.route,
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + request.jwt);
            }
        }
    }


    return Rx.Observable.fromPromise($.ajax(config));
}

domUsers.subscribe(function (liNode) {
    var ulTag = document.querySelector('.container ul');
    ulTag.appendChild(liNode);
});

Rx.Observable.prototype.authenticate = function (config) {

    // We need a function to handle the fetch request for the JWT
    function getJwt(config) {
        var body;

        // Check the content type header and format the request data accordingly
        if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            body = 'name=' + config.name + '&password=' + config.password;
        }

        // We need some config to specify that this is to be a POST request
        // We set the content type and put the passed-in credentials as the body

        var jqInit = {
            url: config.loginPath,
            type: config.method,
            // prevent jQuery from automatically transforming the data into a query string
            // with setting processData to false.
            processData: false,
            data: body,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Content-Type', config.headers['Content-Type']);
            }
        };

        return Rx.Observable.fromPromise($.ajax(jqInit))
            .map(function (jwt) {
                localStorage.setItem('id_token', jwt.token);
            });
    }

    return this.flatMap(function (credentials) {
        return getJwt(credentials);
    });
};

var loginStream = loginClickStream
    .map(function () {
        console.log('clicked');
        var loginPath = 'http://localhost:8081/api/authenticate';
        var username = document.querySelector('#username').value;
        var password = document.querySelector('#password').value;
        var method = 'POST';
        var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        return {
            loginPath: loginPath,
            name: username,
            password: password,
            method: method,
            headers: headers
        }
    }).authenticate(function (config) {
        return config
    });

loginStream.subscribe(function (c) {

});
