process.env.NODE_ENV = process.env.NODE_ENV || 'testing';
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'testsecret';
process.env.OWNER_ID = process.env.OWNER_ID || '123';
process.env.AUTHORIZED_API_KEY = process.env.AUTHORIZED_API_KEY || 'test-api-key';

const chai = require('chai');
global.expect = chai.expect;
