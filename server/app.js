
const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const session  = require('express-session');
const redis = require('redis');
const passport = require('passport');
const history = require('connect-history-api-fallback');
const cors = require('cors');
const Strategy = require('./auth/Strategy');
const db = require('./data');

const BUILD_DIR = path.join(__dirname, '../build');
const ASSET_DIR = path.join(__dirname, '../assets');
const API_DIR = path.join(__dirname, 'api');

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

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
app.use(favicon(path.join(ASSET_DIR, 'img', 'favicon.ico')));
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

app.use(function(req, res, next) {
    if (req.isAuthenticated()) {
        res.cookie('user', req.user, { maxAge: 86400 });
    }
    next();
});

var scopes = ['identify', 'guilds'];
var prompt = 'consent';

const callbackURL = `http://${devMode ? 'localhost:3000' : 'savepointlodge.com'}/login-redirect`;

passport.use(new Strategy({
    authorizationURL: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code&scope=${scopes.join(' ')}`,
    clientID: process.env.PASSPORT_CLIENT_ID,
    clientSecret: process.env.PASSPORT_SECRET,
    tokenURL: 'https://discord.com/api/oauth2/token',
    callbackURL,
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

const redisStore = devMode ? new RedisStore({ client: redisClient }) : new RedisStore({
    host: 'localhost',
    port: 6379,
    client: redisClient,
    ttl: 86400
});

app.use(session({
    store: redisStore, 
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { secure: devMode ? false : true },
    name: '_splUserSessions'
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/login-redirect',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/') } // auth success
);

app.get('/logout', function(req, res) {
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

const checkHeaders = (referer) => {
    const ACCEPTED_HEADERS = ['localhost:3000', 'savepointlodge.com', 'ec2-35-171-169-208.compute-1.amazonaws.com'];

    let foundAcceptableHeader = false;

    if (referer) {
        ACCEPTED_HEADERS.map(header => {
            if (referer.includes(header)) foundAcceptableHeader = true;
        });
    }

    return foundAcceptableHeader;
}

app.use('/api', function(req, res, next) {
    if (!checkHeaders(req.get('Referer'))) return res.status(401).send('Unauthorized');
    if (req.isAuthenticated() && !db.userdata) return res.redirect('/login');
    req.db = db;
    req.isTesting = process.env.NODE_ENV === 'dev';
    next();
});

app.use('/api/user', require(`${API_DIR}/user`));

app.use('/api/movies', require(`${API_DIR}/movies`));

app.use('/api/commands', require(`${API_DIR}/commands`));

if (process.env.NODE_ENV !== 'production') {
    console.info("Execution directory: ", __dirname);
    console.info("BUILD_DIR: ", BUILD_DIR);
    console.info("ASSET_DIR: ", ASSET_DIR);
    console.info("API_DIR: ", API_DIR);
}

app.listen(port, () => console.log(`Example app listening on port ${port} and env is ${process.env.NODE_ENV}!`));

