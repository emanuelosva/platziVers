/* eslint-disable consistent-return */
/**
 * @fileoverview Express app definition
 */

const express = require('express');
const morgan = require('morgan');
const apiRouter = require('./routes');
const notFound = require('./middlewares/errorHandlerNotFound');
const errorHandler = require('./middlewares/errorHandler');

// --- App definition ---
const app = express();

// --- App settings ---
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- App router
app.use('/api', apiRouter);

// Not found
app.use(notFound);

// Error handlers
app.use(errorHandler);

module.exports = app;
