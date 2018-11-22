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
        'debug': true,
        'httpPort': 3000,
        'httpsPort': 3001,
        'UseHttps': true,
        'keyFile': 'https/key.pem',
        'certFile': 'https/cert.pem',
        'logFileDir': 'logs',
        'dbFileDir': 'db',
        'hashingSecret': 'its mueller time',
        'stripeAuth': '',
        'MailGunAuth': '',
        'siteConfig': {
            'name': 'Pizza-Hub',
            'fullName': 'Pizza-Hub Inc.',
            'motto': 'There\'s a little bit of Italy in each slice',
            'phone': '1-00-EAT- PIES',
            'established': '2018'
        }
    },
    // production environment
    production: {
        'envName': 'production',
        'debug': false,
        'httpPort': 5000,
        'httpsPort': 5001,
        'UseHttps': true,
        'keyFile': 'https/key.pem',
        'certFile': 'https/cert.pem',
        'logFileDir': 'logs',
        'dbFileDir': 'db',
        'hashingSecret': 'impeach 45',
        'stripeAuth': '',
        'MailGunAuth': '',
        'siteConfig': {
            'name': 'Pizza-Hub',
            'fullName': 'Pizza-Hub Inc.',
            'motto': 'We add a little love to each slice.',
            'phone': '1-00-EAT- PIES',
            'established': '2018'
        }
    }
};
// the server will set this on startup in index.js
let BASE_DIR = '';

// environment passed in on the cmd line
const currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// if the env passed in is valid use it otherwise use staging
const CONFIG = typeof (environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

//export environment
module.exports = {
    BASE_DIR,
    CONFIG
};
