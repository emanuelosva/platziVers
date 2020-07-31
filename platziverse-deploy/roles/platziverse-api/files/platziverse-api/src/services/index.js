/* eslint-disable consistent-return */
const { handleError } = require('platziverse-utils');
const Db = require('../lib/db');

const db = new Db();

const connectionDbFailed = async (error) => {
  handleError.log(error);
  return Promise.reject(new Error('Connection Failed'));
};

class ApiServices {
  // eslint-disable-next-line class-methods-use-this
  constructor() {
    db.connect()
      .then((services) => {
        this.agent = services.Agent;
        this.metric = services.Metric;
      })
      .catch(connectionDbFailed);
  }

  async checkAuth({ user, next }) {
    if (!user || !user.username) {
      const unauthorized = new Error('Unauthorized');
      unauthorized.statusCode = 401;
      return next(unauthorized);
    }
    this.user = user;
  }

  async findAllAgents() {
    try {
      let findedAgents;
      this.user.admin
        ? findedAgents = await this.agent.findConnected()
        : findedAgents = await this.agent.findByUsername(this.user.username);
      return findedAgents;
    } catch (error) {
      await connectionDbFailed(error);
    }
  }

  async findAgentUuid({ uuid }) {
    try {
      const findedAgent = await this.agent.findByUuid(uuid);
      return findedAgent;
    } catch (error) {
      await connectionDbFailed(error);
    }
  }

  async findMetricUuid({ uuid }) {
    try {
      const findedMetrics = await this.metric.findByAgentUuid(uuid);
      return findedMetrics;
    } catch (error) {
      await connectionDbFailed(error);
    }
  }

  async findMetricsByTypeUuid({ type, uuid }) {
    try {
      const findedMetrics = await this.metric.findByTypeAgentUuid(type, uuid);
      return findedMetrics;
    } catch (error) {
      await connectionDbFailed(error);
    }
  }

};

module.exports = ApiServices;
