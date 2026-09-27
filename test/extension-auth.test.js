const { createHash } = require('node:crypto');
const ExtensionAuth = require('../server/auth/extensionAuth');
const sinon = require('sinon');

const database = require('./helpers/redis');
const verifier = 'v'.repeat(64);
const challenge = createHash('sha256').update(verifier).digest('base64url');
const redirectUri = 'https://extension.example/';
const audience = 'https://savepointlodge.com';

describe('Extension authorization storage', () => {
    let db, auth, session;
    beforeEach(async () => { db = await database(); auth = new ExtensionAuth(db.client, null, db.prefix); session = { passport: { user: { id: 'user' } }, cookie: { expires: new Date(Date.now() + 10800000).toISOString() } }; auth.sessionStore = { get: (id, callback) => callback(null, id === 'session' ? session : null) }; });
    afterEach(async () => { sinon.restore(); if (db) await db.close(); });
    const issue = () => auth.issueCode({ userId: 'user', sessionId: 'session', challenge, redirectUri, audience });
    it('stores hashes only and issues an add-only credential for 15 minutes', async () => {
        const code = await issue();
        const result = await auth.exchange(code, verifier, redirectUri, audience);
        expect(await auth.authenticate(result.access_token, 'https://dev.savepointlodge.com')).to.equal(null);
        expect(result.scope).to.equal('soundboard:clips:add');
        expect(result.expires_in).to.equal(900);
        expect(result.token_type).to.equal('Bearer');
        expect(JSON.stringify(await db.dump())).not.to.include(result.access_token);
        expect(JSON.stringify(await db.dump())).not.to.include(code);
        const grant = await auth.authenticate(result.access_token, audience);
        expect(grant.userId).to.equal('user');
        expect(await auth.exchange(code, verifier, redirectUri, audience)).to.equal(null);
    });
    it('rejects wrong PKCE, redirect URI, malformed values, and expired codes', async () => {
        const code = await issue();
        expect(await auth.exchange(code, verifier, redirectUri, 'https://dev.savepointlodge.com')).to.equal(null);
        expect(await auth.exchange(code, 'x'.repeat(64), redirectUri, audience)).to.equal(null);
        expect(await auth.exchange(code, verifier, 'https://other.example/', audience)).to.equal(null);
        expect(await auth.exchange(code, 'short', redirectUri, audience)).to.equal(null);
        const clock = sinon.useFakeTimers({ now: Date.now() + 60001, toFake: ['Date'] });
        expect(await auth.exchange(code, verifier, redirectUri, audience)).to.equal(null);
        clock.restore();
    });
    it('fails closed on a malformed stored expiry', async () => {
        const token = await auth.exchange(await issue(), verifier, redirectUri, audience);
        const key = (await db.keys()).find(key => key.includes(':grant:'));
        const grant = JSON.parse(await db.call('get', key));
        delete grant.expiresAt;
        await db.call('set', key, JSON.stringify(grant));
        expect(await auth.authenticate(token.access_token, audience)).to.equal(null);
    });
    it('allows exactly one concurrent redemption', async () => {
        const code = await issue();
        const results = await Promise.all([auth.exchange(code, verifier, redirectUri, audience), auth.exchange(code, verifier, redirectUri, audience)]);
        expect(results.filter(Boolean)).to.have.length(1);
    });
    it('rejects expired tokens and supports owner-bound independent revocation', async () => {
        const first = await auth.exchange(await issue(), verifier, redirectUri, audience);
        const second = await auth.exchange(await issue(), verifier, redirectUri, audience);
        const grant = await auth.authenticate(first.access_token, audience);
        await auth.revoke(grant.id, 'another-user', audience);
        expect(await auth.authenticate(first.access_token, audience)).not.to.equal(null);
        await auth.revoke(grant.id, 'user', audience);
        expect(await auth.authenticate(first.access_token, audience)).to.equal(null);
        expect(await auth.authenticate(second.access_token, audience)).not.to.equal(null);
        expect(await auth.list('user', audience)).to.have.length(1);
        sinon.useFakeTimers({ now: Date.now() + 900001, toFake: ['Date'] });
        expect(await auth.authenticate(second.access_token, audience)).to.equal(null);
        expect(await auth.list('user', audience)).to.have.length(1);
    });
    it('rotates credentials after access expiry and rejects replay and wrong origins', async () => {
        const first = await auth.exchange(await issue(), verifier, redirectUri, audience);
        sinon.useFakeTimers({ now: Date.now() + 900001, toFake: ['Date'] });
        expect(await auth.refresh(first.access_token, audience)).to.equal(null);
        expect(await auth.refresh(first.refresh_token, 'https://dev.savepointlodge.com')).to.equal(null);
        const results = await Promise.all([auth.refresh(first.refresh_token, audience), auth.refresh(first.refresh_token, audience)]);
        expect(results.filter(Boolean)).to.have.length(1);
        const second = results.find(Boolean);
        expect(second.refresh_token).not.to.equal(first.refresh_token);
        expect(await auth.authenticate(second.access_token, audience)).not.to.equal(null);
        expect(await auth.authenticate(first.access_token, audience)).to.equal(null);
        expect(JSON.stringify(await db.dump())).not.to.include(second.refresh_token);
        await auth.revokeRefresh(second.refresh_token, audience);
        expect(await auth.refresh(second.refresh_token, audience)).to.equal(null);
    });
    for (const reason of ['expired', 'deleted', 'signed out', 'different user']) {
        it(`rejects refresh and existing access when the SPL session is ${reason}`, async () => {
            const first = await auth.exchange(await issue(), verifier, redirectUri, audience);
            if (reason === 'expired') session.cookie.expires = new Date(Date.now() - 1).toISOString();
            if (reason === 'deleted') session = null;
            if (reason === 'signed out') delete session.passport.user;
            if (reason === 'different user') session.passport.user.id = 'other';
            expect(await auth.refresh(first.refresh_token, audience)).to.equal(null);
            expect(await auth.authenticate(first.access_token, audience)).to.equal(null);
        });
    }
    it('follows website session extensions without touching or extending its expiry', async () => {
        const first = await auth.exchange(await issue(), verifier, redirectUri, audience);
        const expiry = new Date(Date.now() + 21600000).toISOString();
        session.cookie.expires = expiry;
        sinon.useFakeTimers({ now: Date.now() + 10800001, toFake: ['Date'] });
        expect(await auth.refresh(first.refresh_token, audience)).not.to.equal(null);
        expect(session.cookie.expires).to.equal(expiry);
    });
    it('fails closed on session-store outages', async () => {
        const first = await auth.exchange(await issue(), verifier, redirectUri, audience);
        auth.sessionStore.get = (id, callback) => callback(new Error('offline'));
        try { await auth.refresh(first.refresh_token, audience); throw new Error('Should reject'); }
        catch (error) { expect(error.message).to.equal('offline'); }
    });

    it('expires login codes in Redis and cleans up grants only after their SPL session ends', async () => {
        const code = await issue();
        const key = (await db.keys()).find(key => key.includes(':code:'));
        expect(await db.call('pttl', key)).to.be.within(1, 60000);
        const token = await auth.exchange(code, verifier, redirectUri, audience);
        const grant = await auth.authenticate(token.access_token, audience);
        await auth.cleanup();
        expect(await auth.authenticate(token.access_token, audience)).not.to.equal(null);
        session = null;
        await auth.cleanup();
        expect(await db.call('exists', auth.grantKey(grant.id))).to.equal(0);
        expect(await auth.list('user', audience)).to.deep.equal([]);
        expect(await db.keys()).to.deep.equal([]);
    });
    it('does not recreate a grant when revocation races refresh', async () => {
        const first = await auth.exchange(await issue(), verifier, redirectUri, audience);
        const grant = await auth.authenticate(first.access_token, audience);
        await Promise.all([auth.refresh(first.refresh_token, audience), auth.revoke(grant.id, 'user', audience)]);
        expect(await db.call('exists', auth.grantKey(grant.id))).to.equal(0);
    });

    it('uses the existing Redis session without extending its Redis TTL', async () => {
        const RedisStore = require('connect-redis')(require('express-session'));
        auth.sessionStore = new RedisStore({ client: db.client, prefix: `${db.prefix}session:` });
        await new Promise((resolve, reject) => auth.sessionStore.set('session', session, error => error ? reject(error) : resolve()));
        const key = `${db.prefix}session:session`;
        const ttl = await db.call('pttl', key);
        const token = await auth.exchange(await issue(), verifier, redirectUri, audience);
        expect(await auth.authenticate(token.access_token, audience)).not.to.equal(null);
        expect(await auth.refresh(token.refresh_token, audience)).not.to.equal(null);
        expect(await db.call('pttl', key)).to.be.at.most(ttl);
        await db.call('del', key);
        await auth.cleanup();
        expect(await auth.list('user', audience)).to.deep.equal([]);
    });

});
