'use strict';

const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { tests } = require('platziverse-utils');
const { response } = require('./mocks/response');

// --- Mock Services --- (Db is already tested)
const agentMock = tests.agentServices;
const metricMock = tests.metricServices;
let sandbox = null;
let server = null;
let dbStub = null;
const AgentStub = {};
const MetricStub = {};

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
  AgentStub.findAll = sandbox.stub();
  AgentStub.findAll
    .withArgs().returns(Promise.resolve(agentMock.all));

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
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      const actual = JSON.stringify(res.body);
      const data = agentMock.all;
      const expected = JSON.stringify(response(data, 'agents list', false));
      t.deepEqual(actual, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agent/:uuid', (t) => {
  request(server)
    .get(`/api/agent/${uuid}`)
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
