const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const chalk = require('chalk');
const { join } = require('path');
const { handleError, createLogger } = require('platziverse-utils');

const port = process.env.PORT || 8080;
const logger = createLogger('platziverse:web');

// --- Server ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.disable('x-powered-by');

app.use(express.static(join(__dirname, 'public')));
// --- Server ---

// Socket.io Websockets ---
io.on('connect', (socket) => {
  logger('Socket connected Id:', socket.id);

  socket.on('agent/message', (payload) => {
    logger('Client message', payload);
  });
});
// Socket.io Websockets ---

// --- Server initialization ---
process.on('unhandledRejection', handleError.fatal);

server.listen(port, (err) => {
  if (err) return new Error('Server Error');
  console.log(`${chalk.blueBright('platziverse:web')} listen on port: ${port}`);
});
