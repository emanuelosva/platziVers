'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const metricFixtures = require('./fixtures/metric');

// Stubs
let db = null;
const config = { logging: () => { } };
let AgentStub = null;
let MetricStub = null;
let agentSandbox = null;
let metricSandox = null;

const single = JSON.parse(JSON.stringify({ ...metricFixtures.single }));
const { uuid: agentUuid } = single.agent;
const queryFindOne = { where: { uuid: agentUuid } };
const { type } = single;

test.beforeEach(async () => {
  agentSandbox = sinon.createSandbox();
  metricSandox = sinon.createSandbox();

  // --- Agent ---
  AgentStub = {
    hasMany: agentSandbox.spy(),
  };

  // Agent Stub findOne
  AgentStub.findOne = agentSandbox.stub();
  AgentStub.findOne
    .withArgs(queryFindOne)
    .returns(Promise.resolve(single));

  // --- Metric ---
  MetricStub = {
    belongsTo: metricSandox.spy(),
  };

  // Metric Stub create
  MetricStub.create = metricSandox.stub();
  MetricStub.create
    .withArgs(single)
    .returns(Promise.resolve({ ...single, toJSON: () => single }));

  // Metric Stub findByAgentUuid
  const queryFindByAgentUuid = {
    attributes: ['type'],
    group: ['type'],
    inclde: [{
      attributes: [],
      model: AgentStub,
      where: { uuid: agentUuid },
    }],
    raw: true,
  };

  const queryfindByTypeAgentUuid = {
    attributes: ['id', 'type', 'value', 'createdAt'],
    where: { type },
    limit: 20,
    order: [['createdAt', 'DESC']],
    include: [{
      attributes: [],
      model: AgentStub,
      where: { uuid: agentUuid },
    }],
    raw: true,
  };

  MetricStub.findAll = metricSandox.stub();
  MetricStub.findAll
    .withArgs(queryFindByAgentUuid)
    .returns(Promise.resolve(metricFixtures.findByAgentUuid(agentUuid)))
    .withArgs(queryfindByTypeAgentUuid)
    .returns(Promise.resolve(metricFixtures.findByTypeAgentUuid(type, agentUuid)));

  const setupDatabse = proxyquire('../index', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub,
  });

  db = await setupDatabse(config);
});

test.afterEach(() => {
  agentSandbox = agentSandbox && agentSandbox.restore();
  metricSandox = metricSandox && metricSandox.restore();
});

// --- Test ---
test('Metric', (t) => {
  t.truthy(db.Metric, 'Metric service shoyl exist');
});

test.serial('Metric#create - exist agent', async (t) => {
  const metric = await db.Metric.create(agentUuid, single);

  t.true(AgentStub.findOne.called, 'Agent.findOne should be called');
  t.true(AgentStub.findOne.calledOnce, 'Agent.findOne should be called one time');
  t.true(MetricStub.create.called, 'create method should be called');
  t.true(MetricStub.create.calledOnce, 'create method should be called one time');
  t.deepEqual(metric, single, 'metric should be equal');
});

test.serial('Metric#create - no agent', async (t) => {
  const metric = await db.Metric.create('fakeUuid', single);

  t.true(AgentStub.findOne.called, 'Agent.findOne should be called');
  t.true(AgentStub.findOne.calledOnce, 'Agent.findOne should be called one time');
  t.deepEqual(metric, null, 'metric should null');
});

test.serial('Metric#findByAgentUuid', async (t) => {
  const metrics = await db.Metric.findByAgentUuid(agentUuid);

  t.true(MetricStub.findAll.called, 'findAll should be called');
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once');
  t.deepEqual(metrics, metricFixtures.findByAgentUuid(agentUuid), 'should be return a list with types');
});

test.serial('Metric#findByTypeAgentUuid', async (t) => {
  const metrics = await db.Metric.findByTypeAgentUuid(type, agentUuid);

  t.true(MetricStub.findAll.called, 'findAll should be called');
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once');
  t.deepEqual(metrics, metricFixtures.findByTypeAgentUuid(type, agentUuid));
});
