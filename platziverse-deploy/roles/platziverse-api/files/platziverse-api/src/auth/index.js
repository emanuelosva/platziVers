'use strict';

const jwt = require('jsonwebtoken');

const sign = (payload, secret, cb) => {
  jwt.sign(payload, secret, cb);
};

const verify = (token, secret, cb) => {
  jwt.verify(token, secret, cb);
};

const scope = {
  metric_read: 'metric:read',
  metric_create: 'metric:create',
  metric_update: 'metric:update',
  agent_read: 'agent:read',
  agent_create: 'agent:create',
  agent_update: 'agent:update',
};

module.exports = {
  sign,
  verify,
  scope,
};
