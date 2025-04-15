const chai = require('chai');
const { expect } = chai;
const supertest = require('supertest');
const express = require('express');
const sinon = require('sinon');
const soundboardRouter = require('../server/api/soundboard');
const myinstants = require('../server/api/myinstants');

describe.skip('Soundboard API', () => {
    let app;
    let getTrendingStub, getRecentStub, searchStub, getByCategoryStub;

    beforeEach(() => {
        // Create a fresh Express app for each test
        app = express();
        app.use(express.json());

        // Stub the myinstants functions
        getTrendingStub = sinon.stub(myinstants, 'getTrending');
        getRecentStub = sinon.stub(myinstants, 'getRecent');
        searchStub = sinon.stub(myinstants, 'search');
        getByCategoryStub = sinon.stub(myinstants, 'getByCategory');

        // Use the router
        app.use('/api/soundboard', soundboardRouter);
    });

    afterEach(() => {
        // Restore the stubbed functions
        sinon.restore();
    });

    it('should return trending sounds for /myinstants', async () => {
        // Mock the getTrending function to return sample data
        getTrendingStub.resolves([{ id: '1', name: 'Sound1' }, { id: '2', name: 'Sound2' }]);

        const res = await supertest(app).get('/api/soundboard/myinstants?lang=en&page=1');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '1', name: 'Sound1' });
    });

    it('should return recent sounds for /myinstants/recent', async () => {
        // Mock the getRecent function to return sample data
        getRecentStub.resolves([{ id: '3', name: 'RecentSound1' }, { id: '4', name: 'RecentSound2' }]);

        const res = await supertest(app).get('/api/soundboard/myinstants/recent?lang=en&page=1');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '3', name: 'RecentSound1' });
    });

    it('should return search results for /myinstants/search', async () => {
        // Mock the search function to return sample data
        searchStub.resolves([{ id: '5', name: 'SearchResult1' }, { id: '6', name: 'SearchResult2' }]);

        const res = await supertest(app).get('/api/soundboard/myinstants/search?lang=en&query=test&page=1');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '5', name: 'SearchResult1' });
    });

    it('should return sounds by category for /myinstants/:category', async () => {
        // Mock the getByCategory function to return sample data
        getByCategoryStub.resolves([{ id: '7', name: 'CategorySound1' }, { id: '8', name: 'CategorySound2' }]);

        const res = await supertest(app).get('/api/soundboard/myinstants/test-category?lang=en&page=1');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '7', name: 'CategorySound1' });
    });

    it('should return a 500 error if getTrending fails', async () => {
        // Mock the getTrending function to throw an error
        getTrendingStub.rejects(new Error('Trending fetch failed'));

        const res = await supertest(app).get('/api/soundboard/myinstants?lang=en&page=1');
        expect(res.status).to.equal(500);
        expect(res.text).to.include('Trending fetch failed');
    });
});