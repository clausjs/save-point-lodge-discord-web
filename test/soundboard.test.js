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
            .get('/api/soundboard/myinstants?lang=en&page=1')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '1', name: 'Sound1' });
    });

    it('returns recent sounds for /myinstants/recent', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants/recent?lang=en&page=1')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '3', name: 'RecentSound1' });
    });

    it('returns search results for /myinstants/search', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants/search?lang=en&query=test&page=1')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '5', name: 'SearchResult1' });
    });

    it('returns sounds by category for /myinstants/:category', async () => {
        const res = await supertest(baseUrl)
            .get('/api/soundboard/myinstants/test-category?lang=en&page=1')
            .set('Referer', 'http://localhost');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '7', name: 'CategorySound1' });
    });
});