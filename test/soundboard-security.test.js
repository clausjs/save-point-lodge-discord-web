const express = require('express');
const request = require('supertest');
const sinon = require('sinon');
const dns = require('node:dns');
const { parseClip, addClip, publicLookup, resolveMyInstant } = require('../server/soundboard/clips');
const guard = require('../server/auth/soundboard');
const origin = 'https://savepointlodge.com';
const clip = { name: 'Test', url: 'https://www.myinstants.com/media/sounds/test.mp3' };

describe('Soundboard write boundaries', () => {
    let user, add, app;
    beforeEach(() => {
        user = { id: '123', username: 'Actual uploader', isSoundboardUser: true };
        add = sinon.stub().resolves();
        app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            req.user = user;
            req.isAuthenticated = () => Boolean(user);
            req.db = { firebase: { soundboard: { add } } };
            next();
        });
        app.use(guard(origin));
        app.post('/add', addClip);
        app.put('/:id', (req, res) => res.sendStatus(204));
        app.delete('/:id', (req, res) => res.sendStatus(204));
    });
    it('replaces claimed attribution and strips untrusted fields', async () => {
        const res = await request(app).post('/add').set('Origin', origin).send({ ...clip, uploadedBy: 'Spoofed', favoritedBy: ['attacker'], id: 'injected' }).expect(200);
        expect(res.body.uploadedBy).to.equal(user.username);
        expect(res.body).not.to.have.property('id');
        expect(res.body).not.to.have.property('favoritedBy');
        sinon.assert.calledOnceWithExactly(add, res.body);
    });
    for (const method of ['post', 'put', 'delete']) {
        it(`denies ${method} without a soundboard session even with legacy credentials`, async () => {
            user = null;
            await request(app)[method]('/add?token=legacy&apiKey=legacy').set('Origin', origin).send(clip).expect(401);
            user = { id: '123', isSoundboardUser: false };
            await request(app)[method]('/add').set('Origin', origin).send(clip).expect(403);
            sinon.assert.notCalled(add);
        });
    }
    it('rejects foreign, sibling-environment, and missing origins', async () => {
        for (const foreign of ['https://myinstants.com', 'https://dev.savepointlodge.com', 'null']) {
            await request(app).post('/add').set('Origin', foreign).send(clip).expect(403);
        }
        await request(app).post('/add').send(clip).expect(403);
        sinon.assert.notCalled(add);
    });
    it('rejects bad clip data without writing it', async () => {
        for (const input of [{ ...clip, volume: 101 }, { ...clip, tags: [2] }, { ...clip, url: 'https://127.0.0.1/a.mp3' }]) {
            await request(app).post('/add').set('Origin', origin).send(input).expect(400);
        }
        sinon.assert.notCalled(add);
    });
});

describe('Clip validation and Myinstants imports', () => {
    afterEach(() => sinon.restore());
    it('accepts normalized fields and ignores client ownership', async () => {
        const parsed = await parseClip({ ...clip, tags: [' Hi '], volume: 0 });
        expect(parsed.tags).to.deep.equal(['hi']);
        expect(parsed.volume).to.equal(0);
    });
    it('rejects malformed metadata and unapproved sources', async () => {
        const invalid = [null, [], { ...clip, name: '' }, { ...clip, tags: 'tag' }, { ...clip, tags: Array(21).fill('tag') },
            { ...clip, volume: '50' }, { ...clip, description: 'a'.repeat(2001) }, { ...clip, sourceUrl: 'https://www.myinstants.com/instant/test/' }];
        for (const url of ['http://www.myinstants.com/test.mp3', 'https://evil.example/test.mp3', 'https://www.myinstants.com.evil.example/test.mp3',
            'https://user@www.myinstants.com/test.mp3', 'https://www.myinstants.com:444/test.mp3', 'https://www.myinstants.com/test.html']) invalid.push({ ...clip, url });
        for (const value of invalid) {
            try { await parseClip(value); throw new Error('Expected rejection'); } catch (error) { expect(error.status).to.equal(400); }
        }
    });
    it('resolves one approved page with bounded reads and no redirects', async () => {
        const fetchPage = sinon.stub().resolves({ ok: true, headers: { get: () => 'text/html' }, text: async () => '<meta property="og:audio" content="/media/sounds/test.mp3">' });
        expect(await resolveMyInstant('https://www.myinstants.com/en/instant/test/', fetchPage)).to.equal(clip.url);
        const options = fetchPage.firstCall.args[1];
        expect(options.redirect).to.equal('error');
        expect(options.size).to.equal(512 * 1024);
        expect(options.timeout).to.equal(5000);
        expect(options.agent.options.lookup).to.equal(publicLookup);
    });
    it('rejects an unsafe page before fetching and an unsafe extracted audio URL', async () => {
        const fetchPage = sinon.stub();
        try { await resolveMyInstant('https://127.0.0.1/instant/test/', fetchPage); } catch (error) { expect(error.status).to.equal(400); }
        sinon.assert.notCalled(fetchPage);
        fetchPage.resolves({ ok: true, headers: { get: () => 'text/html' }, text: async () => '<meta property="og:audio" content="https://evil.example/test.mp3">' });
        try { await resolveMyInstant('https://www.myinstants.com/instant/test/', fetchPage); throw new Error('Expected rejection'); }
        catch (error) { expect(error.status).to.equal(400); }
    });
    it('blocks private, mapped, link-local, and mixed DNS answers at connection time', async () => {
        const lookup = sinon.stub(dns, 'lookup');
        for (const address of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '100.64.0.1', '::1', '::ffff:127.0.0.1', 'fc00::1']) {
            lookup.callsFake((host, options, callback) => callback(null, [{ address, family: address.includes(':') ? 6 : 4 }, { address: '8.8.8.8', family: 4 }]));
            await new Promise(resolve => publicLookup('www.myinstants.com', {}, error => { expect(error).to.be.an('error'); resolve(); }));
        }
        lookup.callsFake((host, options, callback) => callback(null, [{ address: '8.8.8.8', family: 4 }]));
        await new Promise(resolve => publicLookup('www.myinstants.com', {}, (error, address) => { expect(error).to.equal(null); expect(address).to.equal('8.8.8.8'); resolve(); }));
    });
});
