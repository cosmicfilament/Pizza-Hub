'use strict';

/**
    * @file config file constants
    * @module config.js
    * @description  configuration values
    * @exports the current environment's configurations values
*/

//Container for all environments
const environments = {

    // default staging environment
    staging: {
        'envName': 'staging',
        'httpPort': 3000,
        'httpsPort': 3001,
        'UseHttps': true,
        'keyFile': 'key.pem',
        'certFile': 'cert.pem',
        'hashingSecret': 'its mueller time'
    },
    // production environment
    production: {
        'envName': 'production',
        'httpPort': 5000,
        'httpsPort': 5001,
        'UseHttps': true,
        'keyFile': 'key.pem',
        'certFile': 'cert.pem',
        'hashingSecret': 'impeach 45'
    }
};

// environment passed in on the cmd line
const currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// if the env passed in is valid use it otherwise use staging
const envToExport = typeof (environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

//export environment
module.exports = envToExport;
