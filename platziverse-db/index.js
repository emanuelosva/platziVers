'use strict';

const setupDatabase = require('./lib/db');
const setupAgentModel = require('./models/agent');
const setupMetricModel = require('./models/metric');

module.exports = async (config) => {
  // Setup for db and Models
  const sequelize = setupDatabase(config);
  const AgentModel = setupAgentModel(config);
  const MetricModel = setupMetricModel(config);

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
