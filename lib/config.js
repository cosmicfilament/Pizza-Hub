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
    'MailGunPath': ''
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
    'MailGunPath': ''
  }
};

let baseDirCfg = '';

// environment passed in on the cmd line
const currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// if the env passed in is valid use it otherwise use staging
const envCfg = typeof (environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

//export environment
module.exports = {
  baseDirCfg,
  envCfg
};
