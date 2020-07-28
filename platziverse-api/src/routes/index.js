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
api.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params;
  try {
    response.success(req, res, 200, { uuid }, 'agent retrieved');
  } catch (error) {
    next(error);
  }
});

/**
 * @abstract Response with all metrics for agent that match the uuid
 * @param {string} uuid - The metric uuid
 */
api.get('/metrics/:uuid', (req, res, next) => {
  const { uuid } = req.params;
  try {
    response.success(req, res, 200, { uuid }, 'metric retrieved');
  } catch (error) {
    next(error);
  }

});

/**
 * @abstract Response an specif metric for the agent that match the uuid
 * @param {string} uuid - The metric uuid
 * @param {string} type - The metric type
 */
api.get('/metrics/:uuid/:type', (req, res, next) => {
  const { uuid, type } = req.params;
  try {
    response.success(req, res, 200, { uuid, type }, 'metric retrieved');
  } catch (error) {
    next(error);
  }
});

module.exports = api;
