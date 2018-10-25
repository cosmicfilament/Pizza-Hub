'use strict';

/*
*
* Entry point for the Pizza-Hub app
*
*/

const server = require('./lib/server');
const workers = require('./lib/workers');

// Declare the app
const app = {};

// Init function
app.init = () => {
    // Start the server
    server.init();

    // Workers are going to handle all of the checks
    // Start the workers
    //workers.init();
};

// Self executing
app.init();

// Export the app
module.exports = app;
