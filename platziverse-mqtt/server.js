'use strict';

const debug = require('debug')('platziverse:mqtt');
const net = require('net');
const aedes = require('aedes');
const redisPersistance = require('aedes-persistence-redis');
const chalk = require('chalk');
const db = require('platziverse-db');

const logger = (title, body) => {
  debug(chalk.greenBright(title), body || '');
};

const handleFatalError = (err) => {
  console.error(chalk.redBright(err.message));
  console.error(err.stack);
  process.exit(1);
};

// --- Config ---
const PORT = 1883;
const CONFIG = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASSWORD || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  dialect: 'postgres',
  logging: (s) => debug(s),
};

// --- Server ---
const aedesServer = aedes({
  persistence: redisPersistance({
    port: 6379,
    host: '127.0.0.1',
    family: 4,
    maxSessionDelivery: 100,
  }),
});

const server = net.createServer(aedesServer.handle);
server.listen(PORT, (err) => {
  if (err) handleFatalError(err);
  else logger('Server is running');
});

// Store clients connected
// const clients = new Map();
let Agent;
let Metric;

// --- Server events ---
server.on('listening', async () => {
  try {
    const model = await db(CONFIG);
    Agent = model.Agent;
    Metric = model.Metric;
    console.log(Agent, Metric);
    debug('Models connected');
  } catch (error) {
    handleFatalError(error);
  }
});

aedesServer.on('client', (client) => {
  logger('Client connected: id ->', client.id);
});

aedesServer.on('clientDisconnect', (client) => {
  logger('Client disconnected: id->', client.id);
});

aedesServer.on('publish', (packet, client) => {
  logger('Recived:', packet.topic.toString());
  logger('Payload', packet.payload.toString());
});

// Error handling
aedesServer.on('clientError', (err) => handleFatalError(err));
aedesServer.on('connectionError', (err) => handleFatalError(err));
process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
