'use strict';

const EventEmmiter = require('events');
const os = require('os');
const mqtt = require('mqtt');
const defaults = require('defaults');
const uuid = require('uuid');
const { promisify } = require('util');
const { handleError, parsePayload, createLogger } = require('platziverse-utils');

const logger = createLogger('platziverse:agent');

// --- Options ---
const defaultOptions = {
  name: 'unititled',
  username: 'platzi',
  interval: 5000,
  mqtt: {
    host: 'mqtt://localhost',
  },
};

class PlatziverseAgent extends EventEmmiter {
  constructor(opts) {
    super();

    this._opts = defaults(opts, defaultOptions);
    this._started = false;
    this._timer = null;
    this._client = null;
    this._agentId = null;
    this._metrics = new Map();
  }

  addMetrics(type, fn) {
    this._metrics.set(type, fn);
  };

  removeMetric(type) {
    this._metrics.delete(type);
  }

  connect() {
    if (!this._started) {
      const opts = this._opts;

      this._client = mqtt.connect(opts.mqtt.host);
      this._started = true;

      // Handle connection event
      this._client.on('connect', () => {
        this._agentId = uuid.v4();
        this.emit('connected', this._agentId);

        this._timer = setInterval(async () => {
          let message;

          if (this._metrics.size > 0) {
            message = {
              agent: {
                uuid: this._agentId,
                username: opts.username,
                name: opts.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid,
              },
              metrics: [],
              timestamp: new Date().getTime(),
            };
          }

          // eslint-disable-next-line no-restricted-syntax
          for (let [metric, fn] of this._metrics) {
            if (fn.length === 1) {
              fn = promisify(fn);
            }

            message.metrics.push({
              type: metric,
              // eslint-disable-next-line no-await-in-loop
              value: await Promise.resolve(fn()),
            });
          }

          logger('Sendig', message);
          this._client.publish('agent/message', JSON.stringify(message));
          this.emit('message', message);
        }, opts.interval);
      });

      // Handle message
      this._client.on('message', (topic, payload) => {
        const parsedPayload = parsePayload(payload);

        let broadcast = false;

        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message': {
            broadcast = parsedPayload &&
              parsedPayload.agent &&
              parsedPayload.agent.uuid !== this._agentId;
            break;
          }
        }

        if (broadcast) {
          this.emit(topic, parsedPayload);
        }
      });

      // Handle errors
      this._client.on('error', (err) => {
        handleError.log(err);
        this.disconnect();
      });

      // Available subscription
      this._client.subscribe('agent/message');
      this._client.subscribe('agent/connected');
      this._client.subscribe('agent/disconnected');
    }
  };

  disconnect() {
    if (this._started) {
      clearInterval(this._timer);
      this._started = false;
      this.emit('disconnected', this._agentId);
      this._client.end();
    }
  };
};

module.exports = PlatziverseAgent;
