'use strict';

/**
 * @file entry point for the node server app
 * @author John Butler
 * @module index.js
 */

// provides easy access to the base directory for creating
// paths either from app.getBaseDir or from the config file
const baseDir = require('./lib/config').BASE_DIR = __dirname;
const server = require('./lib/server');
const workers = require('./lib/workers');
const factory = require('./lib/templates/templateFactory');

// Declare the app
const app = {};

// orderly shutdown if during startup have critical failure
app.continueStartup = true;
app.shutdown = (code) => {
    app.continueStartup = false;
    setInterval(() => {
        process.exit(code);
    }, 1000 * 1);
};

app.getBaseDir = () => {
    return baseDir;
};

app.getApp = () => {
    return app;
};

// Init function
app.init = () => {

    // populate the templates with the menu config data and the template config data
    app.continueStartup && factory.init(app);

    // Start the server
    app.continueStartup && server.init();

    // Start the workers
    app.continueStartup && workers.init();
};

app.init();

// Export the app
module.exports = app;
