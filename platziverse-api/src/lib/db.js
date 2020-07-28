const { db, setupConfig } = require('platziverse-db');
const { createLogger, handleError } = require('platziverse-utils');

const logger = createLogger('platziverse:api:db');
const config = { ...setupConfig, logging: (s) => logger('', s) };

class Db {
  constructor() {
    this.services = false;
  }

  async connect() {
    if (!this.services) {
      try {
        this.services = await db(config);
        logger('Connected', 'Db connected');
      } catch (error) {
        handleError.log(error);
        return Promise.reject(new Error('Db connection Failed'));
      }
    }
    return this.services;
  }
}

module.exports = Db;
