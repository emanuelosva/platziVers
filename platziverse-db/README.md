# platziverse-db

## Usage
```javascript
const setupDatabse = require('platziverse-db');

setupDatabse(config)
  .then(db => {
  const { Agent, Metric } = db;
  })
  .catch(err => comeAction(err));
```
