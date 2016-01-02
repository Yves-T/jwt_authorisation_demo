var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
var expressJwt = require('express-jwt');

var jwt = require('jsonwebtoken');


var config = require('./config');
var User = require('./app/models/user');

var port = process.env.PORT || 8081;
mongoose.connect(config.database);

// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});

app.set('superSecret', config.secret);

var jwtCheck = expressJwt({
    secret: app.get('superSecret')
});


app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/setup', function (req, res) {
    // create a sample user
    var nick = new User({
        name: 'Nick Cerminara',
        password: 'password',
        admin: true
    });

    nick.save(function (err) {
        if (err) {
            throw err;
        }

        console.log('User saved successfully');
        res.json({success: true});
    });

});

// API routes

var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function (req, res) {
// find the user
    User.findOne({
        name: req.body.name
    }, function (err, user) {
        if (err) {
            throw err;
        }
        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found'});
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password'});
            } else {
                // if the user is found and the password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 1440 * 60 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token',
                    token: token
                });
            }
        }
    });
});

apiRoutes.use('/users', jwtCheck);

apiRoutes.get('/', function (req, res) {
    res.json({message: 'Welcome to the coolest API on earth'});
});

apiRoutes.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        res.json(users);
    });
});

app.use('/api', apiRoutes);

app.listen(port);
console.log('Magic happens at http://localhost:' + port);
