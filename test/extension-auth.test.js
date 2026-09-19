const { createHash } = require('node:crypto');
const ExtensionAuth = require('../server/data/sources/extensionAuth');
const sinon = require('sinon');

const database = require('./helpers/firestore');
const verifier = 'v'.repeat(64);
const challenge = createHash('sha256').update(verifier).digest('base64url');
const redirectUri = 'https://extension.example/';
const audience = 'https://savepointlodge.com';

describe('Extension authorization storage', () => {
    let db, auth;
    beforeEach(() => { db = database(); auth = new ExtensionAuth(db); });
    afterEach(() => sinon.restore());
    const issue = () => auth.issueCode({ userId: 'user', challenge, redirectUri, audience });
    it('stores hashes only and issues an add-only credential for 15 minutes', async () => {
        const code = await issue();
        const result = await auth.exchange(code, verifier, redirectUri, audience);
        expect(await auth.authenticate(result.access_token, 'https://dev.savepointlodge.com')).to.equal(null);
        expect(result.scope).to.equal('soundboard:clips:add');
        expect(result.expires_in).to.equal(900);
        expect(result.token_type).to.equal('Bearer');
        expect(JSON.stringify([...db.data])).not.to.include(result.access_token);
        expect(JSON.stringify([...db.data])).not.to.include(code);
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
        const grant = [...db.data.values()][0];
        delete grant.expiresAt;
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
        expect(await auth.list('user', audience)).to.have.length(0);
    });
});
