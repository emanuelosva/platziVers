const express = require('express');
const chalk = require('chalk');
const { join } = require('path');
const { handleError } = require('platziverse-utils');

const port = process.env.PORT || 8080;

// --- Server ---
const server = express();
server.use(express.static(join(__dirname, 'public')));
// --- Server ---

// --- Server initialization ---
process.on('unhandledRejection', handleError.fatal);

server.listen(port, (err) => {
  if (err) return new Error('Server Error');
  console.log(`${chalk.greenBright('platziverse:web')} listen on port: ${port}`);
});
