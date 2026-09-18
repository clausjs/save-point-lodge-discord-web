const supertest = require('supertest');

process.env.NODE_ENV = 'testing';
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'testsecret';
let start, stop;

describe('Soundboard API (e2e)', () => {
    let baseUrl;
    let server;
    let originalModule;

    before(async () => {
        // Ensure a clean reload of app with stubbed myinstants
        const appPath = require.resolve('../server/app');
        const routerPath = require.resolve('../server/api/soundboard');
        const myinstantsPath = require.resolve('../server/api/myinstants');

        originalModule = require.cache[myinstantsPath];
        require.cache[myinstantsPath] = {
            id: myinstantsPath,
            filename: myinstantsPath,
            loaded: true,
            exports: {
                getTrending: async () => [{ id: '1', name: 'Sound1' }, { id: '2', name: 'Sound2' }],
                getRecent: async () => [{ id: '3', name: 'RecentSound1' }, { id: '4', name: 'RecentSound2' }],
                search: async () => [{ id: '5', name: 'SearchResult1' }, { id: '6', name: 'SearchResult2' }],
                getByCategory: async () => [{ id: '7', name: 'CategorySound1' }, { id: '8', name: 'CategorySound2' }],
            }
        };

        // Clear app and router caches so they import stubbed myinstants
        delete require.cache[appPath];
        delete require.cache[routerPath];

        ({ start, stop } = require('../server/app'));
        server = await start(0);
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        // Restore original module
        const modulePath = require.resolve('../server/api/myinstants');
        if (originalModule) {
            require.cache[modulePath] = originalModule;
        } else {
            delete require.cache[modulePath];
        }
        await stop();
    });

    it('returns trending sounds for /myinstants', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants?lang=en&page=1&token=abc123');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '1', name: 'Sound1' });
    });

    it('returns recent sounds for /myinstants/recent', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants/recent?lang=en&page=1&token=abc123');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '3', name: 'RecentSound1' });
    });

    it('returns search results for /myinstants/search', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants/search?lang=en&query=test&page=1&token=abc123');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '5', name: 'SearchResult1' });
    });

    it('returns sounds by category for /myinstants/:category', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants/test-category?lang=en&page=1&token=abc123');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '7', name: 'CategorySound1' });
    });

    it('rejects soundboard requests without token, session, or apiKey', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants?lang=en&page=1')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(401);
        expect(res.text).to.match(/Unauthorized/i);
    });

    it('allows soundboard requests with an accepted apiKey', async () => {
        const res = await supertest(baseUrl)
            .get(`/api/soundboard/myinstants?lang=en&page=1&apiKey=${process.env.AUTHORIZED_API_KEY}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
    });
});


describe('Soundboard token add API', () => {
    const sinon = require('sinon');
    const db = require('../server/data');
    let app;
    let sandbox;
    let getUserByToken;
    let add;
    let fetchMember;

    before(() => {
        app = require('../server/app').app;
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(process, 'env').value({ ...process.env, SPL_ID: 'guild-id', DISCORD_BOT_TOKEN: 'bot-token' });
        getUserByToken = sandbox.stub().resolves({ userId: 'member-id' });
        add = sandbox.stub().resolves();
        sandbox.stub(db, 'firebase').value({ streamdeck: { getUserByToken }, soundboard: { add } });
        fetchMember = sandbox.stub(global, 'fetch').resolves({
            ok: true,
            status: 200,
            json: async () => ({ user: { id: 'member-id', username: 'Member' } })
        });
    });

    afterEach(() => sandbox.restore());

    it('adds a JSON clip using the path token and the guild member username', async () => {
        const clip = { name: 'Hello', url: 'https://example.com/hello.mp3', tags: ['hello'], volume: 30 };
        const res = await supertest(app).post('/api/soundboard/valid-token/add')
            .send({ ...clip, uploadedBy: 'Someone else' });

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ ...clip, uploadedBy: 'Member' });
        sinon.assert.calledOnceWithExactly(getUserByToken, 'valid-token');
        sinon.assert.calledOnceWithExactly(fetchMember,
            'https://discord.com/api/v10/guilds/guild-id/members/member-id',
            { headers: { Authorization: 'Bot bot-token' } });
        sinon.assert.calledOnceWithExactly(add, res.body);
    });

    for (const authorization of [null, {}]) {
        it(`rejects an unrecognized token (${JSON.stringify(authorization)}) before lookup or save`, async () => {
            getUserByToken.resolves(authorization);
            const res = await supertest(app).post('/api/soundboard/invalid-token/add').send({});
            expect(res.status).to.equal(401);
            sinon.assert.notCalled(fetchMember);
            sinon.assert.notCalled(add);
        });
    }

    it('does not allow an API key or query token to bypass the path token', async () => {
        getUserByToken.resolves(null);
        const res = await supertest(app)
            .post(`/api/soundboard/invalid-token/add?apiKey=${process.env.AUTHORIZED_API_KEY}&token=abc123`)
            .send({});
        expect(res.status).to.equal(401);
        sinon.assert.calledOnceWithExactly(getUserByToken, 'invalid-token');
        sinon.assert.notCalled(add);
    });

    it('rejects a token owner who is no longer a guild member', async () => {
        fetchMember.resolves({ ok: false, status: 404 });
        const res = await supertest(app).post('/api/soundboard/valid-token/add').send({});
        expect(res.status).to.equal(403);
        sinon.assert.notCalled(add);
    });

    it('returns 500 when Discord cannot fetch the member', async () => {
        fetchMember.resolves({ ok: false, status: 503 });
        const res = await supertest(app).post('/api/soundboard/valid-token/add').send({});
        expect(res.status).to.equal(500);
        sinon.assert.notCalled(add);
    });

    it('does not save an unexpected member response', async () => {
        fetchMember.resolves({ ok: true, json: async () => ({ user: { id: 'other', username: 'Other' } }) });
        const res = await supertest(app).post('/api/soundboard/valid-token/add').send({});
        expect(res.status).to.equal(500);
        sinon.assert.notCalled(add);
    });

    it('returns 500 when saving fails', async () => {
        add.rejects(new Error('Save failed'));
        const res = await supertest(app).post('/api/soundboard/valid-token/add')
            .send({ name: 'Hello', url: 'https://example.com/hello.mp3' });
        expect(res.status).to.equal(500);
    });

    it('validates the token even when it overlaps another route name', async () => {
        getUserByToken.resolves(null);
        const res = await supertest(app).post('/api/soundboard/favorite/add').send({});
        expect(res.status).to.equal(401);
        sinon.assert.calledOnceWithExactly(getUserByToken, 'favorite');
        sinon.assert.notCalled(add);
    });

    it('keeps the normal add route protected', async () => {
        const res = await supertest(app).post('/api/soundboard/add').send({});
        expect(res.status).to.equal(401);
        sinon.assert.notCalled(add);
    });
});
