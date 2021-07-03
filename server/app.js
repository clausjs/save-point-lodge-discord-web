
const dotenv = require('dotenv').config();
const express = require('express')
const session  = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const history = require('connect-history-api-fallback');
const cors = require('cors');
const Strategy = require('./auth/Strategy');
const db = require('./data');

const app = express();
const port = 3000;

db.authenticate();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("assets"));
app.use(history({
    rewrites: [
        {
            from: /^\/api\/.*$/,
            to: function(context) {
                return context.parsedUrl.pathname;
            }
        },
        {
            from: /\/login/,
            to: function(context) {
                return context.parsedUrl.pathname;
            }
        },
        {
            from: /\/logout/,
            to: function(context) {
                return context.parsedUrl.pathname;
            }
        }
    ]
}));
app.use("/", express.static('./build', {
    index: "index.html"
}));

var scopes = ['identify', 'guilds'];
var prompt = 'consent';

passport.use(new Strategy({
    authorizationURL: 'https://discord.com/api/oauth2/authorize?client_id=447971052270780436&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin-redirect&response_type=code&scope=identify%20guilds',
    clientID: '447971052270780436',
    clientSecret: 'GJtMziXNeS4ueJe6bl7Jl_RNCPWQHI_f',
    callbackURL: 'http://localhost:3000/login-redirect',
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.use(session({
    secret: 'save-point-lodge-discord-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/login-redirect',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/members') } // auth success
);

app.get('/logout', function(req, res) {
    console.log("hit logout")
    req.logout();
    res.redirect('/');
});

app.use(cors());

// this middleware will be executed for every request to the app
app.use("/js/*", function (req, res, next) {
    res.header("Content-Type",'application/json');
    next();
});

//Kill event
process.on('kill', function() {
    console.log('Process has been murdered.');
    db.shutdown();
});
  
//Ctrl + C event
process.on('SIGINT', function() { 
    console.log('Manual kill executed.');
    db.shutdown();
});

//Errors and Ctrl + C will fire this event.
// process.on('exit', function() {
//     logger.silly("You should have killed me when you had the chance");
// });

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use('/api', function(req, res, next) {
    req.db = db;
    req.isTesting = process.env.NODE_ENV === 'dev';
    next();
});

app.use('/api/user', require('./api/user'));

app.use('/api/movies', function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("User is not authenticated");
}, require('./api/movies'));

app.use('/api/commands', require('./api/commands'));

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// app.use(bodyParser.urlencoded({extended: true}));

app.listen(port, () => console.log(`Example app listening on port ${port} and env is ${process.env.NODE_ENV}!`));

