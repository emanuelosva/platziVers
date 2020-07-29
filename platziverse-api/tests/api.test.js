'use strict';

const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { promisify } = require('util');
const { tests } = require('platziverse-utils');
const { response } = require('./mocks/response');
const auth = require('../src/auth');
const config = require('../src/config');

// --- Mock Services --- (Db is already tested)
const agentMock = tests.agentServices;
const metricMock = tests.metricServices;
let sandbox = null;
let server = null;
let dbStub = null;
const AgentStub = {};
const MetricStub = {};

// --- Mock auth ---
const sign = promisify(auth.sign);
let token = null;

// Constant params mocks
const { uuid } = metricMock.single.agent;
const badUuid = 'badUui';
const type = 'temp';
const badType = 'badType';

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();

  // --- DB stubs ---
  dbStub = {
    setupConfig: {},
    db: () => Promise.resolve({
      Agent: AgentStub,
      Metric: MetricStub,
    }),
  };
  // --- DB stubs ---

  // --- Agent stub ---
  AgentStub.findConnected = sandbox.stub();
  AgentStub.findConnected
    .withArgs().returns(Promise.resolve(agentMock.connected));

  AgentStub.findByUuid = sandbox.stub();
  AgentStub.findByUuid
    .withArgs(uuid).returns(agentMock.single)
    .withArgs(badUuid).returns(undefined);
  // --- Agent stub ---

  // --- Metric stub ---
  MetricStub.findByAgentUuid = sandbox.stub();
  MetricStub.findByAgentUuid
    .withArgs(uuid).returns([metricMock.findByAgentUuid(uuid)])
    .withArgs(badUuid).returns([]);

  MetricStub.findByTypeAgentUuid = sandbox.stub();
  MetricStub.findByTypeAgentUuid
    .withArgs(type, uuid)
    .returns(metricMock.findByTypeAgentUuid(type, uuid).metrics)
    .withArgs(type, badUuid).returns([])
    .withArgs(badType, uuid)
    .returns([])
    .withArgs(badType, badUuid)
    .returns([]);

  // --- Metric stub ---

  // --- Auth mocks ---
  token = await sign(
    {
      admin: true,
      username: 'platzi',
    },
    config.auth.secret,
  );
  // --- Auth mocks ---

  // --- Server instance mock
  const dbMock = proxyquire('../src/lib/db', {
    'platziverse-db': dbStub,
  });
  const ApiServiceMock = proxyquire('../src/services/index', {
    '../lib/db': dbMock,
  });
  const apiMock = proxyquire('../src/routes/index', {
    '../services': ApiServiceMock,
  });
  server = proxyquire('../src/app', {
    './routes': apiMock,
  });
  // --- Server instance mock

});

test.afterEach(() => {
  sandbox && sinon.restore();
});

// --- Tests Routes ----
test.serial.cb('/api/agents', (t) => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      const actual = JSON.stringify(res.body);
      const data = agentMock.connected;
      const expected = JSON.stringify(response(data, 'agents list', false));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agent/:uuid', (t) => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      const actual = JSON.stringify(res.body);
      const data = agentMock.single;
      const expected = JSON.stringify(response(data, 'agent retrieved', false));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agent/:uuid - Not Found', (t) => {
  request(server)
    .get(`/api/agent/${badUuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return error, response only');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON.stringify(response(data, `Agent Not Found with uuid: ${badUuid}`, true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid', (t) => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return error');
      const actual = JSON.stringify(res.body);
      const data = [metricMock.findByAgentUuid(uuid)];
      const expected = JSON.stringify(response(data, 'metric retrieved', false));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid - Not Found', (t) => {
  request(server)
    .get(`/api/metrics/${badUuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return error, response only');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON.stringify(response(data, `Metrics Not Found for agentUui: ${badUuid}`, true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/:type', (t) => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return error');
      const actual = JSON.stringify(res.body);
      const data = metricMock.findByTypeAgentUuid(type, uuid).metrics;
      const expected = JSON.stringify(response(data, 'metric retrieved', false));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/:type - Not Found bad uuid', (t) => {
  request(server)
    .get(`/api/metrics/${badUuid}/${type}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return error, response only');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON
        .stringify(response(data, `Metrics Not Found for type: ${type} & uuid: ${badUuid}`, true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/type - Not Found bad type', (t) => {
  request(server)
    .get(`/api/metrics/${uuid}/${badType}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return error, response only');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON
        .stringify(response(data, `Metrics Not Found for type: ${badType} & uuid: ${uuid}`, true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/type - Not Found bad uuid and type', (t) => {
  request(server)
    .get(`/api/metrics/${badUuid}/${badType}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return error, response only');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON
        .stringify(response(data, `Metrics Not Found for type: ${badType} & uuid: ${badUuid}`, true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agents - Unauthorized', (t) => {
  request(server)
    .get('/api/metrics/agents')
    .expect(401)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'only return unahorized response');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON
        .stringify(response(data, 'Unauthorized', true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agent/:uuid - Unauthorized', (t) => {
  request(server)
    .get(`/api/metrics/agents/${uuid}`)
    .expect(401)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'only return unahorized response');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON
        .stringify(response(data, 'Unauthorized', true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid - Unauthorized', (t) => {
  request(server)
    .get(`/api/metrics/metric/${uuid}`)
    .expect(401)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'only return unahorized response');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON
        .stringify(response(data, 'Unauthorized', true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/:type - Unauthorized', (t) => {
  request(server)
    .get(`/api/metric/agents/${uuid}/${type}`)
    .expect(401)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'only return unahorized response');
      const actual = JSON.stringify(res.body);
      const data = {};
      const expected = JSON
        .stringify(response(data, 'Unauthorized', true));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});
