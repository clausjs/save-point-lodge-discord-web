const chai = require('chai');
const { expect } = chai;
const supertest = require('supertest');
const express = require('express');
const statusRouter = require('../server/api/status');

describe('Status API', () => {
    let app;

    beforeEach(() => {
        // Create a fresh Express app for each test
        app = express();
        app.use(express.json());

        // Use the status router
        app.use('/api/status', statusRouter);
    });

    it('should return a success response for GET /', async () => {
        const res = await supertest(app).get('/api/status');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.deep.equal({ success: true });
    });
});