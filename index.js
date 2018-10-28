'use strict';

/**
* @file Main file for the application
* @author John Butler
* @module index.json
* @description entry point for the node server app
*/

const server = require('./lib/server');
const workers = require('./lib/workers');
const helpers = require('./utils/helpers');
const config = require('./lib/config');
const fs = require('fs');

// Declare the app
const app = {};

// the one menu to rule them all. Read from a file on startup
app.menu = [];

// Init function
app.init = () => {
  // read in the menu and if it fails no use starting up the server
  const leBuffier = fs.readFileSync(`${__dirname}/.db/menu/${config.menuFile}`);
  if (!helpers.validateObject(leBuffier)) {
    return helpers.log('red', 'Aborting server start. Could not parse the menu.');
  }
  app.menu = JSON.parse(leBuffier);

  // Start the server
  server.init();

  // Workers are going to handle all of the checks
  // Start the workers
  workers.init();
};

// Self executing
app.init();

// Export the app
module.exports = app;
