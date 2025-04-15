const chai = require('chai');
const { expect } = chai;
const supertest = require('supertest');
const express = require('express');
const sinon = require('sinon');
const userRouter = require('../server/api/user');
const { reduceUser } = require('../server/auth/utils');
const { soundboardOpts, userOpts } = require('../server/api/testData');

describe('User API', () => {
    let app;
    let isAuthenticatedStub, userOptsGet, userOptsSet, soundboardOptsGet, soundboardOptsSet;
    let reqUser;

    beforeEach(() => {
        // Create a fresh Express app for each test
        app = express();
        app.use(express.json());

        // Mock middleware
        isAuthenticatedStub = sinon.stub();
        userOptsGet = sinon.stub();
        userOptsSet = sinon.stub();
        soundboardOptsGet = sinon.stub();
        soundboardOptsSet = sinon.stub();
        reqUser = { id: '123', isSoundboardUser: true, isPlanetExpressMember: false };

        app.use((req, res, next) => {
            req.isAuthenticated = isAuthenticatedStub;
            req.user = reqUser;
            req.db = {
                firebase: {
                    userOpts: {
                        get: userOptsGet,
                        set: userOptsSet
                    },
                    soundboardOpts: {
                        get: soundboardOptsGet,
                        set: soundboardOptsSet
                    },
                },
            };
            next();
        });

        // Use the user router
        app.use('/api/user', userRouter);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return reduced user data when authenticated', async () => {
        isAuthenticatedStub.returns(true);

        const res = await supertest(app).get('/api/user');
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ id: '123' });
    });

    it('should return null when not authenticated', async () => {
        isAuthenticatedStub.returns(false);

        const res = await supertest(app).get('/api/user');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.null;
    });

    it('should return user options for /opts', async () => {
        userOptsGet.resolves(userOpts);

        const res = await supertest(app).get('/api/user/opts');
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(userOpts);
    });

    it('should return soundboard options for /soundboard/opts', async () => {
        soundboardOptsGet.resolves(soundboardOpts);

        const res = await supertest(app).get('/api/user/soundboard/opts');
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(soundboardOpts);
    });

    it('should save user options for POST /opts', async () => {
        userOptsSet.resolves(userOpts);

        const res = await supertest(app).post('/api/user/opts').send(userOpts);
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(userOpts);
    });

    it('should save soundboard options for POST /soundboard/opts', async () => {
        soundboardOptsSet.resolves(soundboardOpts);

        const res = await supertest(app).post('/api/user/soundboard/opts').send(soundboardOpts);
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(soundboardOpts);
    });

    it('should return true for /soundboarder when isSoundboardUser is true', async () => {
        isAuthenticatedStub.returns(true);

        const res = await supertest(app).get('/api/user/soundboarder');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.true;
    });

    it('should return false for /soundboarder when not authenticated', async () => {
        isAuthenticatedStub.returns(false);

        const res = await supertest(app).get('/api/user/soundboarder');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.false;
    });

    it('should return true for /lodgeguest when isPlanetExpressMember is true', async () => {
        reqUser.isPlanetExpressMember = true;
        isAuthenticatedStub.returns(true);

        const res = await supertest(app).get('/api/user/lodgeguest');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.true;
    });

    it('should return false for /lodgeguest when not authenticated', async () => {
        isAuthenticatedStub.returns(false);

        const res = await supertest(app).get('/api/user/lodgeguest');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.false;
    });
});