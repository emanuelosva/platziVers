const express = require('express');
const response = require('../middlewares/response');

// --- API router ---
const api = express.Router();

/**
 * @abstract Response with all connected agents
 */
api.get('/agents', (req, res, next) => {
  response.success(req, res, 200, {}, 'agents list');
});

/**
 * @abstract Response with the agent info
 * @param {string} uuid - The agent uuid
 */
api.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params;
  response.success(req, res, 200, { uuid }, 'agent retrieved');
});

/**
 * @abstract Response with all metrics for agent that match the uuid
 * @param {string} uuid - The metric uuid
 */
api.get('/metrics/:uuid', (req, res, next) => {
  const { uuid } = req.params;
  response.success(req, res, 200, { uuid }, 'metric retrieved');

});

/**
 * @abstract Response an specif metric for the agent that match the uuid
 * @param {string} uuid - The metric uuid
 * @param {string} type - The metric type
 */
api.get('/metrics/:uuid/:type', (req, res, next) => {
  const { uuid, type } = req.params;
  response.success(req, res, 200, { uuid, type }, 'metric retrieved');
});

module.exports = api;
