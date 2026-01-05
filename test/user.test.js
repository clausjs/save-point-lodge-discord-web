const supertest = require('supertest');

process.env.NODE_ENV = 'testing';
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'testsecret';
process.env.OWNER_ID = process.env.OWNER_ID || '123';
const { start, stop } = require('../server/app');

describe('User API (e2e)', () => {
    let baseUrl;
    let server;
    let agent;

    before(async () => {
        server = await start(0);
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        agent = supertest.agent(baseUrl);
    });

    after(async () => {
        await stop();
    });

    it('returns reduced user data when authenticated', async () => {
        await agent
            .post('/login')
            .send({ username: 'test', password: 'test' });

        const res = await agent
            .get('/api/user')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.deep.include({ id: process.env.OWNER_ID });
    });

    it('returns null when not authenticated', async () => {
        const res = await supertest(baseUrl)
            .get('/api/user')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.null;
    });

    it('returns true for /soundboarder when testing', async () => {
        const res = await supertest(baseUrl)
            .get('/api/user/soundboarder')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.true;
    });

    it('returns true for /lodgeguest when testing', async () => {
        const res = await supertest(baseUrl)
            .get('/api/user/lodgeguest')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.true;
    });
});