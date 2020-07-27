# platziverse-agent

## Usage

```js
const PlatziverseAgent = require('platziverse-agent');

const agent = new PlatziverseAgent({
  interval: 2000,
});

agent.connect();

//  Events only for this agent
agent.on('connected');
agent.on('diconnected');
agent.on('message');

// Events for external agents
agent.on('agent/connected');
agent.on('agent/disconnected');
agent.on('agent/message', payload => {
  someActionWithPayload(payload);
});

setTimeout(() => agent.disconnect(), someTime);
```