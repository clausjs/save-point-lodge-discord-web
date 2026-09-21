const express = require('express');
const request = require('supertest');
const sinon = require('sinon');
const grantMiddleware = require('../server/auth/extensionGrant');
const token = `spl_ext_${'a'.repeat(32)}.${'b'.repeat(64)}`;

describe('Extension API permission boundary', () => {
    let authenticate, memberLookup, addClip, app;
    beforeEach(() => {
        authenticate = sinon.stub().resolves({ userId: 'member', scope: 'soundboard:clips:add' });
        memberLookup = sinon.stub().resolves({ id: 'member', username: 'Verified user' });
        addClip = sinon.spy((req, res) => res.json({ id: req.user.id, username: req.user.username }));
        app = express();
        app.use('/api', grantMiddleware({ db: { extensionAuth: { authenticate } }, memberLookup, addClip }));
        app.use((req, res) => res.status(418).send('session fallback'));
    });
    it('permits only add and obtains user identity from Discord', async () => {
        const res = await request(app).post('/api/soundboard/add').set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body).to.deep.equal({ id: 'member', username: 'Verified user' });
        sinon.assert.calledOnceWithExactly(memberLookup, 'member');
        sinon.assert.calledOnce(addClip);
    });
    for (const [method, path] of [['get', '/soundboard'], ['delete', '/soundboard/id'], ['put', '/soundboard/id'], ['post', '/soundboard/favorite/id'], ['post', '/extension/soundboard/play'], ['get', '/user']]) {
        it(`rejects ${method} ${path} before invoking any mutation`, async () => {
            await request(app)[method]('/api' + path).set('Authorization', `Bearer ${token}`).expect(403);
            sinon.assert.notCalled(addClip);
            sinon.assert.notCalled(memberLookup);
        });
    }
    it('rejects bad/expired/revoked credentials rather than falling back to session or API key', async () => {
        await request(app).post('/api/soundboard/add?apiKey=anything').set('Authorization', 'Bearer legacy').expect(401);
        authenticate.resolves(null);
        await request(app).post('/api/soundboard/add').set('Authorization', `Bearer ${token}`).expect(401);
        sinon.assert.notCalled(addClip);
    });
    it('checks current membership and fails closed on upstream outages', async () => {
        memberLookup.resolves(null);
        await request(app).post('/api/soundboard/add').set('Authorization', `Bearer ${token}`).expect(403);
        memberLookup.rejects(new Error('private error'));
        const res = await request(app).post('/api/soundboard/add').set('Authorization', `Bearer ${token}`).expect(503);
        expect(res.text).not.to.include('private error');
        sinon.assert.notCalled(addClip);
    });
});

describe('Current Discord soundboard membership', () => {
    afterEach(() => sinon.restore());
    it('requires the actual soundboard role and matching Discord user ID', async () => {
        sinon.stub(process, 'env').value({ ...process.env, DISCORD_BOT_TOKEN: 'test-bot', SPL_ID: 'guild', SOUNDBOARD_ROLE_ID: 'configured-role' });
        const member = { user: { id: 'member', username: 'Verified user' }, roles: ['configured-role'] };
        const fetchMember = sinon.stub().resolves({ ok: true, status: 200, json: async () => member });
        expect(await grantMiddleware.getMember('member', fetchMember)).to.deep.equal(member.user);
        expect(fetchMember.firstCall.args[1].redirect).to.equal('error');
        member.roles = [];
        expect(await grantMiddleware.getMember('member', fetchMember)).to.equal(null);
        member.user.id = 'different';
        try { await grantMiddleware.getMember('member', fetchMember); throw new Error('Expected failure'); }
        catch (error) { expect(error.message).to.equal('Invalid member response.'); }
        fetchMember.resolves({ status: 404, ok: false });
        expect(await grantMiddleware.getMember('member', fetchMember)).to.equal(null);
    });
    it('requires role configuration before making a Discord request', async () => {
        sinon.stub(process, 'env').value({ DISCORD_BOT_TOKEN: 'test-bot', SPL_ID: 'guild' });
        const fetchMember = sinon.stub();
        try { await grantMiddleware.getMember('member', fetchMember); throw new Error('Expected failure'); }
        catch (error) { expect(error.message).to.equal('Discord member lookup is not configured.'); }
        sinon.assert.notCalled(fetchMember);
    });

});
