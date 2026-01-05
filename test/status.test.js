const supertest = require('supertest');

process.env.NODE_ENV = 'testing';
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'testsecret';
const { start, stop } = require('../server/app');

describe('Status API (e2e)', () => {
    let baseUrl;
    let server;

    before(async () => {
        server = await start(0);
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    after(async () => {
        await stop();
    });

    it('returns a success response for GET /', async () => {
        const res = await supertest(baseUrl)
            .get('/api/status')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.deep.equal({ success: true });
    });
});