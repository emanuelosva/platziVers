const __debug = require('debug');
const chalk = require('chalk');

// Loggers
const createLogger = (name) => {
  const debug = __debug(name);
  return (title, body) => {
    debug(chalk.greenBright(title), body || '');
  }
};

// Error handlers
const handleFatalError = (err) => {
  console.error(chalk.redBright(err.message));
  console.error(err.stack);
  process.exit(1);
};

const handleError = (err) => {
  console.error(chalk.redBright(err.message));
  console.error(err.stack);
};

// Data parsers
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

// General configurations

module.exports = {
  parsePayload,
  handleError: {
    fatal: handleFatalError,
    log: handleError,
  },
  createLogger,
};