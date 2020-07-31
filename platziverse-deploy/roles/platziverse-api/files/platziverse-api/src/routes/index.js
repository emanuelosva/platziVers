const express = require('express');
const authJwt = require('express-jwt');
const permissions = require('express-jwt-permissions')();
const response = require('../middlewares/response');
const ApiServices = require('../services');
const { scope } = require('../auth');
const config = require('../config');

const apiService = new ApiServices();

// --- API router ---
const api = express.Router();

// --- Router auth settings (All routes are protected) ---
api.use(authJwt({ secret: config.auth.secret, algorithms: ['HS256'] }));
const guard = (scope) => permissions.check(scope);

/**
 * @abstract Response with all connected agents
 */
api.get('/agents', guard([scope.agent_read]), async (req, res, next) => {
  const { user } = req;
  apiService.checkAuth({ user, next });
  try {
    const agents = await apiService.findAllAgents();
    response.success(req, res, 200, agents, 'agents list');
  } catch (error) {
    next(error);
  }
});

/**
 * @abstract Response with the agent info
 * @param {string} uuid - The agent uuid
 */
api.get('/agent/:uuid', guard([scope.metric_read]), async (req, res, next) => {
  const { uuid } = req.params;
  const { user } = req;
  apiService.checkAuth({ user, next });
  try {
    const agent = await apiService.findAgentUuid({ uuid });
    agent
      ? response.success(req, res, 200, agent, 'agent retrieved')
      : response.error(req, res, 404, {}, `Agent Not Found with uuid: ${uuid}`);
  } catch (error) {
    next(error);
  }
});

/**
 * @abstract Response with all metrics for agent that match the uuid
 * @param {string} uuid - The metric uuid
 */
api.get('/metrics/:uuid', guard([scope.metric_read]), async (req, res, next) => {
  const { uuid } = req.params;
  const { user } = req;
  apiService.checkAuth({ user, next });
  try {
    const metrics = await apiService.findMetricUuid({ uuid });
    metrics.length
      ? response.success(req, res, 200, metrics, 'metric retrieved')
      : response.error(req, res, 404, {}, `Metrics Not Found for agentUui: ${uuid}`);
  } catch (error) {
    next(error);
  }
});

/**
 * @abstract Response an specif metric for the agent that match the uuid
 * @param {string} uuid - The metric uuid
 * @param {string} type - The metric type
 */
api.get('/metrics/:uuid/:type', guard([scope.metric_read]), async (req, res, next) => {
  const { uuid, type } = req.params;
  const { user } = req;
  apiService.checkAuth({ user, next });
  try {
    const metrics = await apiService.findMetricsByTypeUuid({ type, uuid });
    metrics.length
      ? response.success(req, res, 200, metrics, 'metric retrieved')
      : response.error(req, res, 404, {}, `Metrics Not Found for type: ${type} & uuid: ${uuid}`);
  } catch (error) {
    next(error);
  }
});

module.exports = api;
