'use strict';

const debug = require('debug')('platziverse:mqtt');
const net = require('net');
const aedes = require('aedes');
const redisPersistance = require('aedes-persistence-redis');
const chalk = require('chalk');
const { db, setupConfig } = require('platziverse-db');
const { parsePayload } = require('./utils');

const logger = (title, body) => {
  debug(chalk.greenBright(title), body || '');
};

const handleFatalError = (err) => {
  console.error(chalk.redBright(err.message));
  console.error(err.stack);
  process.exit(1);
};

const handleError = (err) => {
  console.error(chalk.redBright(err.message));
  console.error(err.stack);
};

// --- Config ---
const PORT = 1883;
const CONFIG = { ...setupConfig, logging: (s) => debug(s) };

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
const clients = new Map();
let Agent;
let Metric;

// --- Server events ---
server.on('listening', async () => {
  try {
    const services = await db(CONFIG);
    Agent = services.Agent;
    Metric = services.Metric;
    console.log(Metric);
    debug('Services connected');
  } catch (error) {
    handleFatalError(error);
  }
});

aedesServer.on('client', (client) => {
  logger('Client connected: id ->', client.id);
  clients.set(client.id, null);
});

aedesServer.on('clientDisconnect', (client) => {
  logger('Client disconnected: id->', client.id);
});

// eslint-disable-next-line consistent-return
aedesServer.on('publish', async (packet, client) => {
  logger('Recived:', packet.topic.toString());

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected': {
      logger('Payload:', packet.payload.toString());
      break;
    }
    case 'agent/message': {
      const payload = parsePayload(packet.payload);
      logger('Payload:', payload);

      if (payload) {
        payload.agent.connected = true;
        let agent;
        try {
          agent = await Agent.createOrUpdate(payload.agent);
        } catch (error) {
          return handleError(error);
        }

        logger('Agent saved. uuid:', agent.uuid);

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent);
          aedesServer.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected,
              },
            }),
          });
        }
      }
      break;
    }
    default: {
      break;
    }
  }
});

// Error handling
aedesServer.on('clientError', (err) => handleFatalError(err));
aedesServer.on('connectionError', (err) => handleFatalError(err));
process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
