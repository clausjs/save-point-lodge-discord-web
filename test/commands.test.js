const supertest = require('supertest');
process.env.NODE_ENV = 'testing';
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'testsecret';
const { start, stop } = require('../server/app');
const testCommands = require('../server/api/testData').commands;

describe('Commands API (e2e)', () => {
    let baseUrl;
    let server;

    before(async () => {
        server = await start(0); // use ephemeral port
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    after(async () => {
        await stop();
    });

    it('returns all non-private message type commands', async function () {
        this.timeout(8000);
        const res = await supertest(baseUrl)
            .get(`/api/commands?apiKey=${process.env.AUTHORIZED_API_KEY}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(
            testCommands.filter((c) => c.type === 1 && !c.private).length
        );
    });

    it('rejects unauthorized requests without session or apiKey', async function () {
        const res = await supertest(baseUrl)
            .get('/api/commands')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(401);
        expect(res.text).to.match(/Unauthorized/i);
    });
});
