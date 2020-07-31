'use stric';

const Sequelize = require('sequelize');

let sequelize = null;

module.exports = function setupDatabse(config) {
  if (!sequelize) {
    sequelize = new Sequelize(config);
  }
  return sequelize;
};
