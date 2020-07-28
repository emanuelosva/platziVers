const { handleError } = require('platziverse-utils');
const Db = require('../lib/db');

const db = new Db();

class ApiServices {
  // eslint-disable-next-line class-methods-use-this
  async findAllAgents() {
    try {
      const { Agent } = await db.connect();
      const findedAgents = await Agent.findAll();
      return findedAgents;
    } catch (error) {
      handleError.log(error);
      return Promise.reject(new Error('Connection Failed'));
    }
  }
};

module.exports = ApiServices;
