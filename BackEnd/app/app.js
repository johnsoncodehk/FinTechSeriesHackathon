var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var redis = require('redis');

var RedisStore = require('connect-redis')(session);
var redisClient = redis.createClient();
var store =  new RedisStore({
                host: 'localhost',
                port: 6379,
                client: redisClient
            });
var maxAge = 60 * 60 * 1000;
var cookie = { path: '/',
               httpOnly: true, 
               secure: false, 
               maxAge: maxAge};

var request = require('./routes/request');
var create = require('./routes/create');
var signup = require('./routes/signup');
var login = require('./routes/login');

// Init App
var app = express();

// All environment settings
// app.set('port', process.env.PORT || 8080);
app.set('port', process.env.PORT || 9600);

// Middleware section
// 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// Express session middleware
app.use(session({
    secret: 'sdkjjkdsfjksdfkhds',
    resave: true,
    saveUninitialized: true,
    maxAge: maxAge,
    store: store,
    client: redisClient,
    cookie: cookie,
    logErrors: true // for dev env
}));

// BodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: false}));

app.use('/', request);
app.use('/create', create);
app.use('/signup', signup);
app.use('/login', login);

app.use(function (req, res, next) {
    res.status(404).send('The requested URL ' + req.originalUrl + ' was not found on this server.')
})

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});