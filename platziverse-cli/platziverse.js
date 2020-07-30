#!/usr/bin/env node

'use strict';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');
const PlatziverseAgent = require('platziverse-agent');

/**
 * Screen instace
 ***************************************/
const screen = blessed.screen();

/**
 * Graphic components
 ***************************************/
/***************************************/

// --- Grid ----
const Grid = contrib.grid;
const grid = new Grid({
  rows: 1,
  cols: 4,
  screen,
});

// --- Tree ---
const tree = grid.set(0, 0, 1, 1, contrib.tree, {
  label: 'Connected Agents',
});

// --- Line for chart ---
const line = grid.set(0, 1, 1, 3, contrib.line, {
  label: 'Metric',
  showLegend: true,
  minY: 0,
  xPadding: 5,
});

/***************************************/
/***************************************/

/**
 * Render graphics on agent events
 ***************************************/
/***************************************/

// --- Render  agents ---
function renderData(agents, agentMetrics) {
  const treeData = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [uuid, agent] of agents) {
    const title = `${agent.name} - ${agent.pid}`;
    treeData[title] = {
      uuid,
      agent: true,
      children: {},
    };

    const metrics = agentMetrics.get(uuid);
    Object.keys(metrics).forEach((type) => {
      const metric = {
        uuid,
        type,
        metric: true,
      };
      const metricName = ` ${type}`;
      treeData[title].children[metricName] = metric;
    });
  }

  tree.setData({
    extended: true,
    children: treeData,
  });

  screen.render();
};
/**************************************/
/**************************************/

/**
 * Agent and Metric structures
 **************************************/
/**************************************/
const agent = new PlatziverseAgent();

const agents = new Map();
const agentMetrics = new Map();

// --- Events ---
agent.on('agent/connected', (payload) => {
  const { uuid } = payload.agent;

  if (!agents.has(uuid)) {
    agents.set(uuid, payload.agent);
    agentMetrics.set(uuid, {});
  }

  renderData(agents, agentMetrics);
});

agent.on('agent/disconnected', (payload) => {
  const { uuid } = payload.agent;
  if (agents.has(uuid)) {
    agents.delete(uuid);
    agentMetrics.delete(uuid);
  }

  renderData(agents, agentMetrics);
});

agent.on('agent/message', (payload) => {
  const { uuid } = payload.agent;
  const { timestamp } = payload;

  if (!agents.has(uuid)) {
    agents.set(uuid, payload.agent);
    agentMetrics.set(uuid, {});
  }

  const metrics = agentMetrics.get(uuid);
  payload.metrics.forEach((m) => {
    const { type, value } = m;

    !Array.isArray(m) ? metrics[type] = [] : '';

    const actuaLength = metrics[type].length;
    actuaLength >= 20 ? metrics[type].shift() : '';

    metrics[type].push({
      value,
      timestamp: moment(timestamp).format('HH:mm:ss'),
    });
  });

  renderData(agents, agentMetrics);
});
/**************************************/
/**************************************/

/**
 * Buttons
 **************************************/
/**************************************/

// --- Exit ----
screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  process.exit(0);
});

// --- Refresh ---
screen.key(['C-r'], (ch, key) => {
  screen.render();
});

/**************************************/
/**************************************/

/**
 * Render and connect agent
 **************************************/
/**************************************/
screen.render();
tree.focus();
agent.connect();
/**************************************/
/**************************************/
