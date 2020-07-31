# platziverse-agent

## Usage

```js
const PlatziverseAgent = require('platziverse-agent');

const agent = new PlatziverseAgent({
  name: 'myApp',
  username: 'admin',
  interval: 2000,
});

// Add metrics dinamically
agent.addMetric('rss', function getRss () {
  return process.memoryUsage().rss;
});

agent.addMetric('promiseMetric', function getRandomPromise () {
  return Promise.resolve(Math.random());
});

agent.addMetric('callbackMetric', function getRandomCallback (cb) {
  setTimeout(() => {
    cb(null, Math.random());
  }, 1000);
});

agent.connect();

//  Events only for this agent
agent.on('connected', handlerEvent);
agent.on('diconnected', handlerEvent);
agent.on('message', handlerEvent);

// Events for external agents
agent.on('agent/connected', handlerEvent);
agent.on('agent/disconnected', handlerEvent);
agent.on('agent/message', payload => {
  handlerEvent(payload);
});

function handlerEvent (payload) {
  console.log(payload);
};

setTimeout(() => agent.disconnect(), someTime);
```