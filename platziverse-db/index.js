'use strict';

const defaults = require('defaults');
const setupDatabase = require('./lib/db');
const setupAgentModel = require('./models/agent');
const setupMetricModel = require('./models/metric');
const agentService = require('./lib/agent');
const metricService = require('./lib/metric');

const platziverseDb = async (config) => {
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

  const Agent = agentService(AgentModel);
  const Metric = metricService(MetricModel, AgentModel);

  return {
    Agent,
    Metric,
  };
};

const setupConfig = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASSWORD || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  dialect: 'postgres',
};

module.exports = {
  db: platziverseDb,
  setupConfig,
};
