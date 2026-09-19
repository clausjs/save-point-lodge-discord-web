const express = require('express');
const request = require('supertest');
const session = require('express-session');
const sinon = require('sinon');
const firefox = require('../server/auth/firefox');
const token = `spl_ext_${'a'.repeat(32)}.${'b'.repeat(64)}`;

describe('Firefox exchange and revocation endpoints', () => {
    let app, auth, user;
    beforeEach(() => {
        user = { id: 'user' };
        auth = {
            exchange: sinon.stub().resolves({ access_token: token, token_type: 'Bearer', expires_in: 900, scope: 'soundboard:clips:add' }),
            refresh: sinon.stub().resolves({ access_token: token }),
            revokeRefresh: sinon.stub().resolves(),
            authenticate: sinon.stub().resolves({ id: 'a'.repeat(32), userId: 'user' }),
            revoke: sinon.stub().resolves(),
            list: sinon.stub().resolves([{ id: 'a'.repeat(32), expiresAt: Date.now() + 900000 }])
        };
        app = express();
        app.use(express.urlencoded({ extended: false }));
        app.use(express.json());
        app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));
        app.use((req, res, next) => { req.user = user; req.isAuthenticated = () => Boolean(user); next(); });
        app.use('/login-extension', firefox({ origin: 'https://savepointlodge.com', db: { firebase: { extensionAuth: auth } } }));
    });
    it('exchanges without a cookie, returning credentials only in a non-cacheable JSON response', async () => {
        user = null;
        const body = { grant_type: 'authorization_code', code: 'c'.repeat(64), code_verifier: 'v'.repeat(64), redirect_uri: firefox.redirectUri };
        const res = await request(app).post('/login-extension/token').send(body).expect(200);
        expect(res.headers['cache-control']).to.equal('no-store');
        expect(res.body.access_token).to.equal(token);
        sinon.assert.calledOnceWithExactly(auth.exchange, body.code, body.code_verifier, body.redirect_uri, 'https://savepointlodge.com');
        auth.exchange.resolves(null);
        await request(app).post('/login-extension/token').send(body).expect(400);
        auth.exchange.resetHistory();
        await request(app).post('/login-extension/token').send({ ...body, redirect_uri: 'https://evil.example/' }).expect(400);
        sinon.assert.notCalled(auth.exchange);
    });
    it('revokes using the credential header, with no cookie or token query support', async () => {
        user = null;
        await request(app).post('/login-extension/revoke').set('Authorization', `Bearer ${token}`).expect(204);
        sinon.assert.calledOnceWithExactly(auth.revoke, 'a'.repeat(32), 'user', 'https://savepointlodge.com');
        auth.revoke.resetHistory();
        await request(app).post(`/login-extension/revoke?token=${token}`).expect(401);
        sinon.assert.notCalled(auth.revoke);
    });
    it('allows website revocation only with a session-bound nonce and owner identity', async () => {
        const agent = request.agent(app);
        const page = await agent.get('/login-extension/connections').expect(200);
        expect(page.text).not.to.include(token);
        const csrf = page.text.match(/name="csrf" value="([a-f0-9]+)"/)[1];
        await agent.post('/login-extension/connections').type('form').send({ id: 'a'.repeat(32), csrf: 'wrong' }).expect(403);
        sinon.assert.notCalled(auth.revoke);
        await agent.post('/login-extension/connections').type('form').send({ id: 'a'.repeat(32), csrf }).expect(303);
        sinon.assert.calledOnceWithExactly(auth.revoke, 'a'.repeat(32), 'user', 'https://savepointlodge.com');
        user = null;
        await agent.post('/login-extension/connections').type('form').send({ id: 'a'.repeat(32), csrf }).expect(403);
    });
    it('refreshes without cookies and fails closed on ended sessions or store failures', async () => {
        user = null;
        const refresh = `spl_refresh_${'a'.repeat(32)}.${'b'.repeat(64)}`;
        await request(app).post('/login-extension/token').send({ grant_type: 'refresh_token', refresh_token: refresh }).expect(200);
        sinon.assert.calledOnceWithExactly(auth.refresh, refresh, 'https://savepointlodge.com');
        auth.refresh.resolves(null);
        await request(app).post('/login-extension/token').send({ grant_type: 'refresh_token', refresh_token: refresh }).expect(400);
        auth.refresh.rejects(new Error('offline'));
        await request(app).post('/login-extension/token').send({ grant_type: 'refresh_token', refresh_token: refresh }).expect(503);
        await request(app).post('/login-extension/revoke').set('Authorization', `Bearer ${refresh}`).expect(204);
        sinon.assert.calledOnceWithExactly(auth.revokeRefresh, refresh, 'https://savepointlodge.com');
    });

});
