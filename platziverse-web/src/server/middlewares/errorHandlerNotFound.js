const response = require('./response');

const notFound = (req, res, next) => {
  response.error(req, res, 404, 'Not Found', 'Not Found');
};

module.exports = notFound;
