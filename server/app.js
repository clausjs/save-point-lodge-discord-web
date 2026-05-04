
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
const DiscordStrategy = require('./auth/DiscordStrategy');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./data');
const { reduceUser } = require('./auth/utils');

const BUILD_DIR = path.join(__dirname, '../build');
const ASSET_DIR = path.join(__dirname, '../assets');
const API_DIR = path.join(__dirname, 'api');

let RedisStore, redisClient;

const devMode = ['dev', 'development', 'testing', 'test'].includes(process.env.NODE_ENV);
const isAlpha = process.env.NODE_ENV === 'alpha';

if (!devMode) {
    RedisStore = require('connect-redis')(session);
    redisClient = redis.createClient({
        host: process.env.REDIS_HOST ?? 'redis',
        port: process.env.REDIS_PORT ?? 6379
    });
}

const app = express();

const portIdentifier = devMode || isAlpha ? 'DEV_PORT' : 'PORT';
const port = process.env[portIdentifier] || 3000;

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

const productionDomain = process.env.PRE_DNS ? "ec2-54-165-53-210.compute-1.amazonaws.com" : `${isAlpha ? 'dev.' : ''}savepointlodge.com`;
const protocol = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'prod_test'  ? 'http' : 'https';
const callbackURL = `${protocol}://${devMode || process.env.NODE_ENV === 'prod_test' ? `localhost:${port}` : `${productionDomain}`}/login-redirect`;
const streamdeckCallbackURL = `${protocol}://${devMode || process.env.NODE_ENV === 'prod_test' ? `localhost:${port}` : `${productionDomain}`}/login-streamdeck`;

passport.use(new LocalStrategy(
    function(username, password, done) {
        const profile = { id: process.env.OWNER_ID, username: 'testUser', avatarUrl: 'https://cdn-icons-png.freepik.com/512/147/147142.png' }
        return done(null, profile);
    }
));

if (!devMode) {
    passport.use('discord', new DiscordStrategy({
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
    
    passport.use('streamdeck', new DiscordStrategy({
        authorizationURL: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_AUTH_CLIENT_ID}&redirect_uri=${streamdeckCallbackURL}&response_type=code&scope=${scopes.join(' ')}`,
        clientID: process.env.DISCORD_AUTH_CLIENT_ID,
        clientSecret: process.env.DISCORD_AUTH_CLIENT_SECRET,
        tokenURL: 'https://discord.com/api/oauth2/token',
        callbackURL: streamdeckCallbackURL,
        scope: scopes,
        prompt: prompt
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));
}


const store = devMode ? new MemoryStore() : new RedisStore({ 
    host: process.env.REDIS_HOST ?? 'redis',
    port: process.env.REDIS_PORT ?? 6379,
    client: redisClient
});

app.use(session({
    store, 
    saveUninitialized: false,
    secret: process.env.AUTH_SESSION_SECRET,
    resave: true,
    rolling: true,
    secure: true,
    cookie: { maxAge: 10800000 },
    sameSite: true,
    name: '_savepointlodgesession',
    ttl: 10800
}));
app.use(passport.initialize());
app.use(passport.session());

if (devMode) {
    app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function(req, res) {
        if (req.user) {
            return res.status(200).json(reduceUser(req.user));
        }
    
        res.status(401).send('Unauthorized');
    });
}

if (!devMode) {
    app.get('/login-discord', passport.authenticate('discord', { scope: scopes, prompt: prompt }));
    app.get('/login-redirect', passport.authenticate('discord', { successRedirect: '/postAuth', failureRedirect: '/' }));
    app.get('/login-sdauth', passport.authenticate('streamdeck', { scope: scopes, prompt: prompt }));
    app.get('/login-streamdeck', passport.authenticate('streamdeck', { successRedirect: "/streamdeck-setup?broadcast=yes", failureRedirect: '/' }));
}

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
    process.exit();
});
  
//Ctrl + C event
process.on('SIGINT', function() { 
    console.log('Manual kill executed.');
    db.shutdown();
    process.exit();
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

const isSoundboardPath = (apiPath) => apiPath === '/soundboard' || apiPath.startsWith('/soundboard/');

const hasAcceptedApiKey = (params) => {
    return Boolean(process.env.AUTHORIZED_API_KEY && params?.apiKey === process.env.AUTHORIZED_API_KEY);
}

const getSoundboardTokenUser = async (streamdeck, token) => {
    if (!token) return null;

    if (devMode && token === 'abc123') {
        return { userId: process.env.OWNER_ID, token };
    }

    if (!streamdeck) return null;

    return streamdeck.getUserByToken(token);
}

app.use('/api', async function(req, res, next) {
    req.db = db;

    if (req.isAuthenticated() && req.user) {
        req.isTesting = devMode;
        req.fakeAuth = process.env.NODE_ENV === 'dev';
        return next();
    }

    if (hasAcceptedApiKey(req.query)) {
        req.isTesting = devMode;
        req.fakeAuth = process.env.NODE_ENV === 'dev';
        return next();
    }

    // Soundboard requests may also authenticate through a Stream Deck token.
    if (isSoundboardPath(req.path) && req.query.token) {
        try {
            const tokenRes = await getSoundboardTokenUser(req.db.firebase?.streamdeck, req.query.token);
            if (!tokenRes) return res.status(401).send('Unauthorized. Token not recognized.');
            const { userId } = tokenRes;
            if (!userId) return res.status(401).send('Unauthorized. Token not recognized.');
            if (devMode) console.log("Soundboard token authenticated for user: ", userId);
        } catch (err) {
            console.error("Error authenticating token: ", err);
            return res.status(500).send();
        }
    } else return res.status(401).send('Unauthorized');

    req.isTesting = devMode;
    req.fakeAuth = process.env.NODE_ENV === 'dev';
    next();
});

app.use('/api/user', require(`${API_DIR}/user`));

app.use('/api/commands', require(`${API_DIR}/commands`));

app.use('/api/giphy', require(`${API_DIR}/giphy`));

app.use('/api/status', require(`${API_DIR}/status`));

app.use('/api/discord', require(`${API_DIR}/discord`));

app.use('/api/soundboard', require(`${API_DIR}/soundboard`));

app.use('/api/download', require(`${API_DIR}/download`));

app.use('/api/arcdb', function(req, res, next) {
    if (redisClient) {
        req.redisClient = redisClient;
    }
    next();
}, require(`${API_DIR}/arcdb`));

if (devMode) {
    console.info("Execution directory: ", __dirname);
    console.info("BUILD_DIR: ", BUILD_DIR);
    console.info("ASSET_DIR: ", ASSET_DIR);
    console.info("API_DIR: ", API_DIR);
}

let httpServer;

function start(portOverride) {
    return new Promise((resolve) => {
        const listenPort = typeof portOverride === 'number' ? portOverride : port;
        httpServer = app.listen(listenPort, () => {
            console.log(`SPL Web listening on port ${httpServer.address().port} and env is ${process.env.NODE_ENV}!`);
            resolve(httpServer);
        });
    });
}

function stop() {
    return new Promise((resolve, reject) => {
        if (!httpServer) return resolve();
        httpServer.close((err) => {
            if (err) return reject(err);
            db.shutdown();
            resolve();
        });
    });
}

if (require.main === module) {
    start();
}

module.exports = { app, start, stop };

