'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

// Stub config
const config = { logging: () => { } };
let db = null;
let sandbox = null;

// Stubs
const MetricStub = {
  belongsTo: sinon.spy(),
};

let AgentStub = null;

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  const setupDatabse = proxyquire('../index', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub,
  });

  db = await setupDatabse(config);
});

test.afterEach(() => {
  sandbox = sandbox && sandbox.restore();
});

test('Agent', (t) => {
  t.truthy(db.Agent, 'Agent service should exist');
});

test.serial('Setup db', (t) => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed');
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'AgentStub.hasMany recives MetrciStub');
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed');
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'MetricStub.delongsTo recives AgentStub');
});
