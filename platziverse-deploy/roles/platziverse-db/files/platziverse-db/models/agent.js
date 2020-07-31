'use strict';

const Sequelize = require('sequelize');
const setupDatabse = require('../lib/db');

module.exports = function setupAgentModel(config) {
  const sequelize = setupDatabse(config);

  return sequelize.define('agent', {
    uuid: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    hostname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pid: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    connected: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
};
