const express = require('express');
const response = require('../middlewares/response');
const ApiServices = require('../services');

const apiService = new ApiServices();

// --- API router ---
const api = express.Router();

/**
 * @abstract Response with all connected agents
 */
api.get('/agents', async (req, res, next) => {
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
api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params;
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
api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params;
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
api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params;
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
