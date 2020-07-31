const response = require('./response');

const errorHandler = (err, req, res, next) => {
  let axiosErrorStatus;
  err.response
    ? axiosErrorStatus = err.response.status : '';

  response.error(req, res, err.statusCode || err.status || axiosErrorStatus, err);
};

module.exports = errorHandler;
