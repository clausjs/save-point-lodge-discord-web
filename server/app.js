
const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express')
const session  = require('cookie-session');
const passport = require('passport');
const history = require('connect-history-api-fallback');
const cors = require('cors');
const Strategy = require('./auth/Strategy');
const db = require('./data');

const BUILD_DIR = path.join(__dirname, '../build');
const ASSET_DIR = path.join(__dirname, '../assets');

console.info("Execution directory: ", __dirname);
console.info("BUILD_DIR: ", BUILD_DIR);
console.info("ASSET_DIR: ", ASSET_DIR);

const app = express();
const devMode = process.env.NODE_ENV !== 'production' ? true : false;

const port = devMode ? 3000 : 8080;

db.authenticate();

// const CSPString = "default-src 'self'; " +
// "font-src 'self' https://fonts.gstatic.com http://fonts.cdnfonts.com; " +
// "img-src 'self'; " +
// "script-src 'self'; " +
// "style-src 'self' https://fonts.googleapis.com http://fonts.cdnfonts.com; " +
// "frame-src 'self' https://discord.com/; " +
// "connect-src 'self' ws://planetexpressmovie.redirectme.net;";

    
    
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(ASSET_DIR));
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

app.use('/', express.static(BUILD_DIR, {
    index: 'index.html'
}));

var scopes = ['identify', 'guilds'];
var prompt = 'consent';

passport.use(new Strategy({
    authorizationURL: 'https://discord.com/api/oauth2/authorize?client_id=447971052270780436&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin-redirect&response_type=code&scope=identify%20guilds',
    clientID: process.env.PASSPORT_CLIENT_ID,
    clientSecret: process.env.PASSPORT_SECRET,
    callbackURL: `http://${devMode ? 'localhost:3000' : 'savepointlodge.com'}/login-redirect`,
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

app.listen(port, () => console.log(`Example app listening on port ${port} and env is ${process.env.NODE_ENV}!`));

