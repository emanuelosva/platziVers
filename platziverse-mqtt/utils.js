'use strict';

const parsePayload = (payload) => {
  let parsedPayload;
  payload instanceof Buffer
    ? parsedPayload = payload.toString()
    : null;

  try {
    parsedPayload = JSON.parse(parsedPayload);
  } catch (error) {
    parsedPayload = null;
  }

  return parsedPayload;
};

module.exports = {
  parsePayload,
};
