'use strict';

const EventEmmiter = require('events');
const mqtt = require('mqtt');
const defaults = require('defaults');
const uuid = require('uuid');
const { handleError, parsePayload } = require('platziverse-utils');

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

        this._timer = setInterval(() => {
          this.emit('agent/message', 'this is a message');
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
      this.emit('disconnected');
    }
  };
};

module.exports = PlatziverseAgent;
