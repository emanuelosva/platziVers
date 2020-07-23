'use strict';

const defaults = require('defaults');
const setupDatabase = require('./lib/db');
const setupAgentModel = require('./models/agent');
const setupMetricModel = require('./models/metric');

module.exports = async (config) => {
  const configDb = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
    query: {
      raw: true,
    },
  });

  // Setup for db and Models
  const sequelize = setupDatabase(configDb);
  const AgentModel = setupAgentModel(configDb);
  const MetricModel = setupMetricModel(configDb);

  // Define relations and foregein keys
  AgentModel.hasMany(MetricModel);
  MetricModel.belongsTo(AgentModel);

  // Test connection
  await sequelize.authenticate();

  if (config.setup) {
    await sequelize.sync({ force: true });
  }

  const Agent = {};
  const Metric = {};

  return {
    Agent,
    Metric,
  };
};
