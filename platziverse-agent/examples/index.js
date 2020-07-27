const PlatziverseAgent = require('../index.js');

const agent = new PlatziverseAgent({
  name: 'myApp',
  username: 'admin',
  interval: 2000,
});

// Add metrics dinamically
agent.addMetric('rss', () => {
  return process.memoryUsage().rss;
});

agent.addMetric('promiseMetric', () => {
  return Promise.resolve(Math.random());
});

agent.addMetric('callbackMetric', (cb) => {
  setTimeout(() => {
    cb(null, Math.random());
  }, 1000);
});

agent.connect();

function handlerEvent(payload) {
  console.log(payload);
};

//  Events only for this agent
agent.on('connected', handlerEvent);
agent.on('diconnected', handlerEvent);
agent.on('message', handlerEvent);

// Events for external agents
agent.on('agent/connected', handlerEvent);
agent.on('agent/disconnected', handlerEvent);
agent.on('agent/message', (payload) => {
  handlerEvent(payload);
});

setTimeout(() => agent.disconnect(), 10000);
