'use strict';

const parsePayload = (payload) => {
  let parsedPayload;
  payload instanceof Buffer
    ? parsedPayload = payload.toString()
    : null;

  try {
    parsedPayload = JSON.parse(parsedPayload);
  } catch (error) {
    parsedPayload = {};
  }

  return parsedPayload;
};

module.exports = {
  parsePayload,
};
