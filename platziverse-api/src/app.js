/* eslint-disable consistent-return */
/**
 * @fileoverview Express app definition
 */

const express = require('express');
const morgan = require('morgan');

// --- App definition ---
const app = express();

// --- App settings ---
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

module.exports = app;
