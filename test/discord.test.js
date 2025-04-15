const chai = require('chai');
const { expect } = chai;
const supertest = require('supertest');
const express = require('express');
const sinon = require('sinon');
const router = require('express').Router();

describe.skip('Discord API', () => {
    let app;
    let fetchDiscordInfoStub;

    beforeEach(() => {
        // Create a fresh Express app for each test
        app = express();
        app.use(express.json());

        // Stub the fetchDiscordInfo function
        fetchDiscordInfoStub = sinon.stub(require('../server/api/discord'), 'fetchDiscordInfo');

        router.get('/members', async (req, res) => {
            try {
                const discordInfo = await fetchDiscordInfoStub();
                res.status(200).send(discordInfo.members);
            } catch (err) {
                res.status(500).send(new Error("Error"));
            }
        });
        // Use the router
        app.use('/api/discord', router);
    });

    afterEach(() => {
        // Restore the stubbed function
        sinon.restore();
    });

    it('should return a list of members when fetchDiscordInfo succeeds', async () => {
        // Mock the fetchDiscordInfo function to return sample data
        fetchDiscordInfoStub.resolves([
            { id: '1', username: 'User1' },
            { id: '2', username: 'User2' },
        ]);

        const res = await supertest(app).get('/api/discord/members');
        console.log("RES: ", res.body);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.deep.include({ id: '1', username: 'User1' });
    });

    it('should return a 500 error when fetchDiscordInfo fails', async () => {
        // Mock the fetchDiscordInfo function to throw an error
        fetchDiscordInfoStub.rejects(new Error('Unable to fetch discord widget data.'));

        const res = await supertest(app).get('/api/discord/members');
        expect(res.status).to.equal(500);
        expect(res.text).to.include('Unable to fetch discord widget data.');
    });
});