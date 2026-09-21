const express = require('express');
const session = require('express-session');
const request = require('supertest');
const { createHash } = require('node:crypto');
const sinon = require('sinon');
const firefox = require('../server/auth/firefox');
const ExtensionAuth = require('../server/auth/extensionAuth');
const extensionGrant = require('../server/auth/extensionGrant');
const { addClip } = require('../server/api/soundboard/clips');
const database = require('./helpers/redis');

describe('Firefox connection to clip creation', () => {
    let redis;
    afterEach(async () => { if (redis) await redis.close(); });
    it('approves, exchanges, renews, adds, rejects an ended session, and revokes', async () => {
        const origin = 'https://savepointlodge.com';
        const verifier = 'v'.repeat(64);
        const challenge = createHash('sha256').update(verifier).digest('base64url');
        const add = sinon.stub().resolves();
        redis = await database();
        const db = { extensionAuth: new ExtensionAuth(redis.client, null, redis.prefix), firebase: { soundboard: { add } } };
        const user = { id: 'user', username: 'Member', isSoundboardUser: true };
        let sessionId;
        const app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        const store = new session.MemoryStore();
        db.extensionAuth.sessionStore = store;
        app.use(session({ store, secret: 'test-secret', cookie: { maxAge: 10800000 }, resave: false, saveUninitialized: false }));
        app.use((req, res, next) => { if (req.path === '/login-extension/confirm') sessionId = req.sessionID;
            req.session.passport = { user }; req.user = user; req.isAuthenticated = () => true; next(); });
        app.use('/login-extension', firefox({ db, origin }));
        app.use('/api', extensionGrant({ db, origin, addClip, memberLookup: async () => user }));
        const browser = request.agent(app);
        await browser.get('/login-extension').query({ redirect_uri: firefox.redirectUri, state: 'a'.repeat(64), code_challenge: challenge, code_challenge_method: 'S256' }).expect(302);
        const page = await browser.get('/login-extension/confirm').expect(200);
        const csrf = page.text.match(/name="csrf" value="([a-f0-9]+)"/)[1];
        const confirmation = await browser.post('/login-extension/confirm').type('form').send({ csrf, decision: 'allow' }).expect(303);
        const code = new URL(confirmation.headers.location).searchParams.get('code');
        // Exchange and API calls deliberately use a new client with no website session cookie.
        const exchange = await request(app).post('/login-extension/token').send({ grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: firefox.redirectUri }).expect(200);
        const renewed = await request(app).post('/login-extension/token').send({ grant_type: 'refresh_token', refresh_token: exchange.body.refresh_token }).expect(200);
        await request(app).post('/api/soundboard/add').set('Authorization', `Bearer ${exchange.body.access_token}`).send({}).expect(401);
        const authorization = `Bearer ${renewed.body.access_token}`;
        await request(app).delete('/api/soundboard/id').set('Authorization', authorization).expect(403);
        const created = await request(app).post('/api/soundboard/add').set('Authorization', authorization)
            .send({ name: 'Clip', url: 'https://www.myinstants.com/media/sounds/test.mp3', uploadedBy: 'Attacker' }).expect(200);
        expect(created.body.uploadedBy).to.equal('Member');
        sinon.assert.calledOnceWithExactly(add, created.body);
        await new Promise((resolve, reject) => store.destroy(sessionId, error => error ? reject(error) : resolve()));
        await request(app).post('/api/soundboard/add').set('Authorization', authorization).send({}).expect(401);
        await request(app).post('/login-extension/token').send({ grant_type: 'refresh_token', refresh_token: renewed.body.refresh_token }).expect(400);
        await request(app).post('/login-extension/revoke').set('Authorization', `Bearer ${renewed.body.refresh_token}`).expect(204);
        await request(app).post('/api/soundboard/add').set('Authorization', authorization).send({}).expect(401);
        sinon.assert.calledOnce(add);
    });
});
