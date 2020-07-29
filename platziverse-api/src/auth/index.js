'use strict';

const jwt = require('jsonwebtoken');

const sign = (payload, secret, cb) => {
  jwt.sign(payload, secret, cb);
};

const verify = (token, secret, cb) => {
  jwt.verify(token, secret, cb);
};

module.exports = {
  sign,
  verify,
};
