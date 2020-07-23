'use strict';

const debug = require('debug')('platziverse:db:setup');
const inquirer = require('inquirer');
const chalk = require('chalk');
const db = require('./index');

const prompt = inquirer.createPromptModule();

const handleFatalError = (err) => {
  debug(chalk.redBright(err.message));
  console.error(err.stack);
  process.exit(1);
};

const setup = async () => {
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'This will distroy your databse, are you sure?',
    },
  ]);

  if (!answer.setup) {
    return debug(chalk.greenBright('Your db is safe :) '));
  }

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASSWORD || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres',
    logging: (s) => debug(s),
    setup: true,
  };

  try {
    await db(config);
    debug(chalk.greenBright('Setup Db succes!'));
    process.exit(0);
  } catch (error) {
    handleFatalError(error);
  }
  return true;
};

setup();
