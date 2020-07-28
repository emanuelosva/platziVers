const response = require('./response');

const errorHandler = (err, req, res, next) => {
  response.error(req, res, err.statusCode, err);
};

module.exports = errorHandler;
