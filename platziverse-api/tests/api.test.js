'use strict';

const test = require('ava');
const request = require('supertest');
const server = require('../src/app');
const { response } = require('./mocks/response');

// --- Tests ----
test.serial.cb('/api/agents', (t) => {
  request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      const { body: actual } = res;
      const expected = response({}, 'agents list', false);
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});
