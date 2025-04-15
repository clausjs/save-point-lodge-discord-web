const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const supertest = require('supertest');
const express = require('express');
const commandsRouter = require('../server/api/commands');
const testCommands = require('../server/api/testData').commands;

chai.use(chaiHttp);

describe('Commands API', () => {
    let app;

    before(() => {
        // Set up a mock Express app
        app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            // Mock middleware to inject testing flag and mock database
            req.db = {
                firebase: {
                    commands: {
                        get: async () => testCommands,
                    },
                },
            };
            next();
        });
        app.use('/api/commands', commandsRouter);
    });

    it('should return all non-private message type commands', async () => {
        const res = await supertest(app).get('/api/commands');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(testCommands.filter(c =>
            c.type === 1 && !c.private
        ).length);
    });

    it('should handle errors gracefully', async () => {
        const errorApp = express();
        errorApp.use(express.json());
        errorApp.use((req, res, next) => {
            req.db = {
                firebase: {
                    commands: {
                        get: async () => {
                            throw new Error('Database error');
                        },
                    },
                }
            };
            next();
        });
        errorApp.use('/api/commands', commandsRouter);

        const res = await supertest(errorApp).get('/api/commands');
        expect(res.status).to.equal(500);
        expect(res.body).to.be.an('object');
    });
});