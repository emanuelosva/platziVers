'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const agentFixtures = require('./fixtures/agent');

// Stub config
const config = { logging: () => { } };
let db = null;
let sandbox = null;

// Stubs
let AgentStub = null;
const MetricStub = {
  belongsTo: sinon.spy(),
};

// const single = { ...agentFixtures.single };
const id = 1;

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  // Function Stibs
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

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

test.serial('Agent#findById', async (t) => {
  const agent = await db.Agent.findById(id);
  t.true(AgentStub.findById.called, 'findById method is called');
  t.true(AgentStub.findById.calledOnce, 'findById method is called only one time');
  t.true(AgentStub.findById.calledWith(id), 'findById method is called with correct args');
  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same');
});
