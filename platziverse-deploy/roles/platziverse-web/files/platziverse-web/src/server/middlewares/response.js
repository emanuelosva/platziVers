const { createLogger } = require('platziverse-utils');
const config = require('../config');

const logger = createLogger('platziverse:api:error');

const STATUS_MESSAGE = {
  201: 'Created',
  204: 'Successful operation',
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbiden',
  404: 'Not Found',
  500: 'Inrernal server error',
};

const success = (req, res, status, data, message) => {
  const statusCode = status || req.statusCode || 200;
  const statusMessage = message || 'Successful operation';

  res.status(statusCode).json({
    error: false,
    message: statusMessage,
    body: data || {},
  });
};

const error = (req, res, status, error, message) => {
  const statusCode = status || req.statusCode || error.statusCode || 500;
  const statusMessage = message || STATUS_MESSAGE[statusCode] || 'Internall error';
  let errorBody;

  if (config.isDev) {
    logger('ERROR', error.message || message);
    error.message
      ? logger('', error.stack)
      : null;
    errorBody = error.stack;
  }

  res.status(statusCode).json({
    error: true,
    message: statusMessage,
    body: errorBody || {},
  });
};

module.exports = {
  success,
  error,
};
