'use strict';

const debug = require('debug')('platziverse:db:example');
const chalk = require('chalk');
const db = require('../index');

const handleFatalError = (err) => {
  debug(chalk.redBright(err.message));
  debug(err.stack);
  process.exit(1);
};

const logger = (title, body) => {
  debug(chalk.greenBright(title), body);
};

const run = async () => {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASSWORD || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres',
    logging: (s) => debug(s),
  };

  try {
    const { Agent, Metric } = await db(config);
    debug(chalk.greenBright('Connection succes!'));

    // --- Aget test methods
    const agent = await Agent.createOrUpdate({
      uuid: 'yyy-xxx',
      name: 'test2',
      username: 'test2',
      hostname: 'test2',
      pid: 2,
      connected: false,
    }).catch(handleFatalError);
    logger('Agent upserted', agent);

    const agents = await Agent.findAll()
      .catch(handleFatalError);
    logger('Agents list', agents);

    // --- Metric test methods
    const metric = await Metric.create(agent.uuid, {
      type: 'temp',
      value: 258,
    }).catch(handleFatalError);
    logger('Metric created', metric);

    const metricsByAgentUuid = await Metric
      .findByAgentUuid(agent.uuid)
      .catch(handleFatalError);
    logger('Metrics by Agent Uuid', metricsByAgentUuid);

    const metrics = await Metric
      .findByTypeAgentUuid('speed', agent.uuid)
      .catch(handleFatalError);
    logger('All metrics by Agent', metrics);

    process.exit(0);
  } catch (error) {
    handleFatalError(error);
  }
};

run();
