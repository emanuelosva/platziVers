'use strict';

const test = require('ava');

const config = { logging: () => { } };
let db = null;

test.beforeEach(async () => {
  // eslint-disable-next-line global-require
  const setupDatabse = require('../index');
  db = await setupDatabse(config);
});

test('Agent', (t) => {
  t.truthy(db.Agent, 'Agent service should exist');
});
