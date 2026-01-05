process.env.NODE_ENV = process.env.NODE_ENV || 'testing';
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'testsecret';
process.env.OWNER_ID = process.env.OWNER_ID || '123';

const chai = require('chai');
global.expect = chai.expect;
