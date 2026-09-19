const supertest = require('supertest');
const express = require('express');
const session = require('express-session');
const sinon = require('sinon');
const firefox = require('../server/auth/firefox');

const state = 'a'.repeat(64);
const beginUrl = `/login-extension?redirect_uri=${encodeURIComponent(firefox.redirectUri)}&state=${state}&code_challenge=${"c".repeat(43)}&code_challenge_method=S256`;

describe('Firefox soundboard login', () => {
    let agent, user, issueCode, clock;
    beforeEach(() => {
        user = { id: 'discord-user', username: '<test-user>', isSoundboardUser: true };
        issueCode = sinon.stub().resolves('b'.repeat(64));
        const app = express();
        app.use(express.urlencoded({ extended: false }));
        app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }));
        app.use((req, res, next) => {
            req.user = user;
            req.isAuthenticated = () => Boolean(user);
            next();
        });
        app.use('/login-extension', firefox({ origin: 'https://savepointlodge.com', db: { firebase: { extensionAuth: { issueCode } } } }));
        agent = supertest.agent(app);
    });
    afterEach(() => { if (clock) { clock.restore(); clock = null; } });
    const consent = async () => {
        await agent.get(beginUrl).expect(302).expect('Location', '/login-extension/confirm');
        const page = await agent.get('/login-extension/confirm').expect(200);
        return { page, csrf: page.text.match(/name="csrf" value="([a-f0-9]+)"/)[1] };
    };

    it('sends signed-out users through the existing Discord login', async () => {
        user = null;
        await agent.get(beginUrl).expect(302).expect('Location', '/login-discord');
        await agent.get('/login-extension/confirm').expect(401);
        expect(issueCode.called).to.equal(false);
    });
    it('returns only a PKCE-bound code after approval and consumes the request', async () => {
        const { page, csrf } = await consent();
        expect(page.headers['cache-control']).to.equal('no-store');
        expect(page.headers['referrer-policy']).to.equal('no-referrer');
        expect(page.headers['content-security-policy']).to.include("frame-ancestors 'none'");
        expect(page.text).to.include('&lt;test-user&gt;');
        expect(page.text).not.to.include('existing-soundboard-token');
        expect(issueCode.called).to.equal(false);
        const response = await agent.post('/login-extension/confirm').type('form').send({ csrf, decision: 'allow' }).expect(303);
        const callback = new URL(response.headers.location);
        expect(response.text).to.equal('');
        expect(callback.origin + callback.pathname).to.equal(firefox.redirectUri);
        expect(callback.hash).to.equal('');
        expect(callback.searchParams.get('code')).to.equal('b'.repeat(64));
        expect(callback.searchParams.get('state')).to.equal(state);
        expect(issueCode.calledOnceWithMatch({ sessionId: sinon.match.string, userId: 'discord-user', challenge: 'c'.repeat(43), redirectUri: firefox.redirectUri, audience: 'https://savepointlodge.com' })).to.equal(true);
        await agent.post('/login-extension/confirm').type('form').send({ csrf, decision: 'allow' }).expect(400);
    });
    it('can resume confirmation after Discord authenticates the session', async () => {
        user = null;
        await agent.get(beginUrl).expect(302);
        user = { id: 'discord-user', isSoundboardUser: true };
        await agent.get('/login-extension/confirm').expect(200);
    });
    it('cancels without reading or returning the token', async () => {
        const { csrf } = await consent();
        const response = await agent.post('/login-extension/confirm').type('form').send({ csrf, decision: 'deny' }).expect(303);
        const params = new URL(response.headers.location).searchParams;
        expect(params.get('error')).to.equal('access_denied');
        expect(params.get('state')).to.equal(state);
        expect(params.has('token')).to.equal(false);
        expect(issueCode.called).to.equal(false);
    });
    it('rejects another host, callback suffix, query, or duplicate redirect URI', async () => {
        for (const redirect of ['https://attacker.example/', firefox.redirectUri + 'extra', firefox.redirectUri + '?extra=1']) {
            await agent.get(`/login-extension?redirect_uri=${encodeURIComponent(redirect)}&state=${state}`).expect(400);
        }
        await agent.get(beginUrl + '&redirect_uri=https://attacker.example/').expect(400);
        expect(issueCode.called).to.equal(false);
    });
    it('rejects missing, malformed, or duplicate state', async () => {
        for (const suffix of ['', '&state=short', `&state=${state}&state=${state}`]) {
            await agent.get(`/login-extension?redirect_uri=${encodeURIComponent(firefox.redirectUri)}${suffix}`).expect(400);
        }
    });
    it('rejects confirmation without a pending login or a matching CSRF nonce', async () => {
        await agent.get('/login-extension/confirm').expect(400);
        await consent();
        await agent.post('/login-extension/confirm').type('form').send({ csrf: 'wrong', decision: 'allow' }).expect(403);
        expect(issueCode.called).to.equal(false);
    });
    it('rejects expired requests', async () => {
        const { csrf } = await consent();
        clock = sinon.useFakeTimers({ now: Date.now() + 300001, toFake: ['Date'] });
        await agent.post('/login-extension/confirm').type('form').send({ csrf, decision: 'allow' }).expect(400);
        expect(issueCode.called).to.equal(false);
    });
    it('requires soundboard membership both before display and after approval', async () => {
        user.isSoundboardUser = false;
        await agent.get(beginUrl).expect(302);
        await agent.get('/login-extension/confirm').expect(403);
        user.isSoundboardUser = true;
        const { csrf } = await consent();
        user.isSoundboardUser = false;
        await agent.post('/login-extension/confirm').type('form').send({ csrf, decision: 'allow' }).expect(403);
        expect(issueCode.called).to.equal(false);
    });
    it('fails closed when code issuance fails', async () => {
        issueCode.rejects(new Error('private database details'));
        const { csrf } = await consent();
        const response = await agent.post('/login-extension/confirm').type('form').send({ csrf, decision: 'allow' }).expect(503);
        expect(response.headers.location).to.equal(undefined);
        expect(response.text).not.to.include('private database details');
    });
    it('requires S256 and a valid challenge', async () => {
        await agent.get(beginUrl.replace('S256', 'plain')).expect(400);
        await agent.get(beginUrl.replace('c'.repeat(43), 'short')).expect(400);
    });

});

// Exercise app middleware too: browser navigation must retain OAuth query parameters.
describe('Firefox login app routing', () => {
    it('preserves redirect URI and state when the browser requests HTML', async () => {
        const { app } = require('../server/app');
        await supertest(app).get(beginUrl).set('Accept', 'text/html').expect(302).expect('Location', '/login-discord');
    });
});
