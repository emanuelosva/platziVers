'use strics';

/* eslint-disable no-use-before-define */
const express = require('express');
const axios = require('axios').default;
const config = require('./config');

const URL = `${config.api.url}/api`;

const request = async (url, method) => {
  const { data, status } = await axios({
    url,
    method,
    headers: { authorization: `Bearer ${config.api.toke}` },
  });

  return { data, status };
};

// --- Proxy Api router ---
const proxyApi = express.Router();

proxyApi.get('/agents', agents);
proxyApi.get('/agent/:uuid', agentUuid);
proxyApi.get('/metrics/:uuid', metricsUuid);
proxyApi.get('/metrics/:uuid/:type', metricsUuidType);
// --- Proxy Api router ---

// --- Callback Functions ---
async function agents(req, res, next) {
  try {
    const url = `${URL}/agents`;
    const { data, status } = await request(url, 'GET');
    res.status(status).json(data.body);
  } catch (error) {
    next(error);
  }
};

async function agentUuid(req, res, next) {
  const { uuid } = req.params;
  try {
    const url = `${URL}/agent/${uuid}`;
    const { data, status } = await request(url, 'GET');
    res.status(status).json(data.body);
  } catch (error) {
    next(error);
  }
};

async function metricsUuid(req, res, next) {
  const { uuid } = req.params;
  try {
    const url = `${URL}/metrics/${uuid}`;
    const { data, status } = await request(url, 'GET');
    res.status(status).json(data.body);
  } catch (error) {
    next(error);
  }
};

async function metricsUuidType(req, res, next) {
  const { uuid, type } = req.params;
  try {
    const url = `${URL}/metrics/${uuid}/${type}`;
    const { data, status } = await request(url, 'GET');
    res.status(status).json(data.body);
  } catch (error) {
    next(error);
  }
};
// --- Callback  Functions ---

module.exports = proxyApi;

