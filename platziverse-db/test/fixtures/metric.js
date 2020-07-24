'use strict';

const agentFixtures = require('./agent');

const metric = {
  id: 1,
  type: 'speed',
  value: 20,
  createdAt: new Date(),
  agentId: 1,
  agent: agentFixtures.byId(1),
};

const createMetric = ({ id, type, value, agentId }) => {
  const newMetric = {
    id,
    type,
    value,
    agentId,
    agent: agentFixtures.byId(agentId),
    createdAt: new Date(),
  };

  return { ...newMetric };
};

const metrics = [
  metric,
  createMetric({ id: 2, type: 'speed', value: 25, agentId: 2 }),
  createMetric({ id: 3, type: 'speed', value: 25, agentId: 1 }),
  createMetric({ id: 4, type: 'temp', value: 50, agentId: 1 }),
  createMetric({ id: 5, type: 'speed', value: 25, agentId: 3 }),
  createMetric({ id: 6, type: 'temp', value: 50, agentId: 2 }),
];

const findByAgentUuid = (uuid) => {
  const types = metrics
    .filter((metric) => metric.agent.uuid === uuid)
    .map((metric) => metric.type);

  return { types: [...new Set(types)] };
};

const findByTypeAgentUuid = (type, uuid) => {
  const types = metrics
    .filter((metric) => metric.type === type)
    .filter((metric) => metric.agent.uuid === uuid)
    .map((metric) => ({
      id: metric.id,
      type: metric.type,
      value: metric.value,
      createdAt: metric.createdAt,
    }))
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);

  return { metrics: [...new Set(types)] };
};

module.exports = {
  single: metric,
  all: metrics,
  findByAgentUuid,
  findByTypeAgentUuid,
};
