
const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const session  = require('express-session');
const MemoryStore = require('memorystore')(session);
const redis = require('redis');
const passport = require('passport');
const history = require('connect-history-api-fallback');
const cors = require('cors');
const Strategy = require('./auth/Strategy');
const db = require('./data');

const BUILD_DIR = path.join(__dirname, '../build');
const ASSET_DIR = path.join(__dirname, '../assets');
const API_DIR = path.join(__dirname, 'api');

let RedisStore, redisClient;

const devMode = process.env.NODE_ENV === 'dev' ? true : false;

if (!devMode) {
    RedisStore = require('connect-redis')(session);
    redisClient = redis.createClient({
        host: process.env.REDIS_HOST ?? 'redis',
        port: process.env.REDIS_PORT ?? 6379
    });
}

const app = express();

const port = process.env.PORT || 3000;

db.authenticate();
app.use(compression());
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
app.use(cors());

app.use('/', express.static(BUILD_DIR, {
    index: 'index.html'
}));

app.use(function(req, res, next) {
    if (req.isAuthenticated()) {
        res.cookie('user', req.user, { maxAge: 86400 });
    }
    next();
});

var scopes = ['identify', 'guilds', 'guilds.members.read'];
var prompt = 'consent';

const productionDomain = process.env.PRE_DNS ? "ec2-54-165-53-210.compute-1.amazonaws.com" : `${process.env.NODE_ENV === 'test' ? 'dev.' : ''}savepointlodge.com`;
const protocol = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'prod_test'  ? 'http' : 'https';
const callbackURL = `${protocol}://${devMode || process.env.NODE_ENV === 'prod_test' ? `localhost:${port}` : `${productionDomain}`}/login-redirect`;

passport.use(new Strategy({
    authorizationURL: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_AUTH_CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code&scope=${scopes.join(' ')}`,
    clientID: process.env.DISCORD_AUTH_CLIENT_ID,
    clientSecret: process.env.DISCORD_AUTH_CLIENT_SECRET,
    tokenURL: 'https://discord.com/api/oauth2/token',
    callbackURL,
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

const store = devMode ? new MemoryStore() : new RedisStore({ 
    host: process.env.REDIS_HOST ?? 'redis',
    port: process.env.REDIS_PORT ?? 6379,
    client: redis.createClient({
        host: process.env.REDIS_HOST ?? 'redis',
        port: process.env.REDIS_PORT ?? 6379
    })
});

app.use(session({
    store, 
    saveUninitialized: false,
    secret: process.env.AUTH_SESSION_SECRET,
    resave: false,
    secure: true,
    cookie: { maxAge: 10800000 },
    sameSite: true,
    name: '_savepointlodgesession',
    ttl: 10800
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

const checkHeaders = (referer, params) => {
    const ACCEPTED_HEADERS = ['localhost', 'dev.savepointlodge.com', 'savepointlodge.com'];

    let foundAcceptableHeader = false;

    if (referer) {
        ACCEPTED_HEADERS.map(header => {
            if (referer.includes(header)) foundAcceptableHeader = true;
        });
    } else if (params) {
        if (params.apiKey === process.env.AUTHORIZED_API_KEY) foundAcceptableHeader = true;
    }

    return foundAcceptableHeader;
}

app.use('/api', function(req, res, next) {;
    if (!checkHeaders(req.get('Referer'), req.query)) return res.status(401).send('Unauthorized');
    req.db = db;
    req.isTesting = process.env.NODE_ENV === 'test';
    next();
});

app.use('/api/user', require(`${API_DIR}/user`));

app.use('/api/movies', require(`${API_DIR}/movies`));

app.use('/api/commands', require(`${API_DIR}/commands`));

app.use('/api/giphy', require(`${API_DIR}/giphy`));

app.use('/api/status', require(`${API_DIR}/status`));

app.use('/api/discord', require(`${API_DIR}/discord`));

app.use('/api/soundboard', require(`${API_DIR}/soundboard`));

if (devMode) {
    console.info("Execution directory: ", __dirname);
    console.info("BUILD_DIR: ", BUILD_DIR);
    console.info("ASSET_DIR: ", ASSET_DIR);
    console.info("API_DIR: ", API_DIR);
}

app.listen(port, () => console.log(`SPL Web listening on port ${port} and env is ${process.env.NODE_ENV}!`));

