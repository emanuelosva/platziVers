const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const chalk = require('chalk');
const { join } = require('path');
const { handleError, createLogger, emiters } = require('platziverse-utils');
const PlatziverseAgent = require('platziverse-agent');
const proxyApi = require('./proxy');
const notFound = require('./middlewares/errorHandlerNotFound');
const errorHandler = require('./middlewares/errorHandler');

const port = process.env.PORT || 8080;
const logger = createLogger('platziverse:web');

// --- Server ---
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');

app.use(express.static(join(__dirname, 'public')));

app.use('/', proxyApi);

// Error handlers
app.use(notFound);
app.use(errorHandler);
// --- Server ---

// --- Mqtt Agent ---
const agent = new PlatziverseAgent();
// --- Mqtt Agent ---

// Socket.io Websockets ---
io.on('connect', (socket) => {
  logger('Socket connected Id:', socket.id);
  emiters.eventPipe(agent, socket);
});
// Socket.io Websockets ---

// --- Server initialization ---
process.on('unhandledRejection', handleError.fatal);

server.listen(port, (err) => {
  if (err) return new Error('Server Error');
  agent.connect();
  console.log(`${chalk.blueBright('platziverse:web')} listen on port: ${port}`);
});
