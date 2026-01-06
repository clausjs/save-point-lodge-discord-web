const supertest = require('supertest');

process.env.NODE_ENV = 'testing';
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'testsecret';
const { start, stop } = require('../server/app');

describe('Discord API (e2e)', () => {
    let baseUrl;
    let server;
    let originalFetch;

    before(async () => {
        originalFetch = global.fetch;
        server = await start(0);
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        global.fetch = originalFetch;
        await stop();
    });

    it('returns a list of members when fetch succeeds', async () => {
        global.fetch = async () => ({
            json: async () => ({ members: [ { id: '1', username: 'User1' }, { id: '2', username: 'User2' } ] })
        });

        const res = await supertest(baseUrl)
            .get('/api/discord/members')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '1', username: 'User1' });
    });

    it('returns 500 when fetch fails', async () => {
        global.fetch = async () => { throw new Error('Unable to fetch discord widget data.'); };

        const res = await supertest(baseUrl)
            .get('/api/discord/members')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(500);
        // Express serializes Error objects as {} by default; status check is sufficient.
    });
});