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

const id = 1;
const single = { ...agentFixtures.single };
const newAgent = agentFixtures.extend(single, { id: 20, uuid: 'yyy-ycv' });
const query = { where: { uuid: single.uuid } };
const queryNewAgent = { where: { uuid: newAgent.uuid } };
const queryUuid = { where: { uuid: single.uuid } };
const username = 'platzi';
const queryUsername = { where: { username, connected: true } };
const queryConnected = { where: { connected: true } };

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  // Model Stub findByID
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  // Model Stub findOne
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne
    .withArgs(query)
    .returns(Promise.resolve(single))
    .withArgs(queryNewAgent)
    .returns(Promise.resolve(null))
    .withArgs(queryUuid)
    .returns(single);

  // Model Stub update
  AgentStub.update = sandbox.stub();
  AgentStub.update
    .withArgs(single, query)
    .returns(Promise.resolve(1));

  // Model Stub update
  AgentStub.create = sandbox.stub();
  AgentStub.create
    .withArgs(newAgent)
    .returns(Promise.resolve({ ...newAgent, toJSON: () => newAgent }));

  // Model Find All
  AgentStub.findAll = sandbox.stub();
  AgentStub.findAll
    .withArgs()
    .returns(Promise.resolve(agentFixtures.all))
    .withArgs(queryUsername)
    .returns(Promise.resolve(agentFixtures.connected))
    .withArgs(queryConnected)
    .returns(Promise.resolve(agentFixtures.connected));

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

test.serial('Agent#createOrUpdate - existing', async (t) => {
  const agent = await db.Agent.createOrUpdate(single);

  t.true(AgentStub.findOne.called, 'find one is called');
  t.true(AgentStub.findOne.calledTwice, 'find one should be called 2 times');
  t.true(AgentStub.update.calledOnce, 'update should be called one times');
  t.deepEqual(agent, single, 'agent should be the same');
});

test.serial('Agent#createOrUpdate - new agent', async (t) => {
  const createdAgent = await db.Agent.createOrUpdate(newAgent);

  t.true(AgentStub.findOne.called, 'find one is called');
  t.true(AgentStub.findOne.calledOnce, 'find one is called');
  t.true(AgentStub.create.called, 'create is called');
  t.true(AgentStub.create.calledOnce, 'create should be called one time');
  t.deepEqual(createdAgent, newAgent, 'createdAgent should be equal to new agent');
});

test.serial('Agent#findByUuid', async (t) => {
  const agent = await db.Agent.findByUuid(single.uuid);

  t.true(AgentStub.findOne.called, 'find one is called');
  t.true(AgentStub.findOne.calledOnce, 'find one is called');
  t.deepEqual(agent, single, 'agent should be equal to single');
});

test.serial('Agent#findAll', async (t) => {
  const agents = await db.Agent.findAll();

  t.true(AgentStub.findAll.called, 'find all is called');
  t.true(AgentStub.findAll.calledOnce, 'find all is called');
  t.deepEqual(agents, agentFixtures.all, 'should return all agents');
});

test.serial('Agent#findByUsername', async (t) => {
  const agents = await db.Agent.findByUsername(username);

  t.true(AgentStub.findAll.called, 'find all is called');
  t.true(AgentStub.findAll.calledOnce, 'find all is called');
  t.deepEqual(agents, agentFixtures.connected, 'should return all agents connected (All are "platzi")');
});

test.serial('Agent#findConnected', async (t) => {
  const agents = await db.Agent.findConnected();

  t.true(AgentStub.findAll.called, 'find all is called');
  t.true(AgentStub.findAll.calledOnce, 'find all is called');
  t.deepEqual(agents, agentFixtures.connected, 'should return all agents connected');
});
