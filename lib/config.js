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
    'keyFile': 'key.pem',
    'certFile': 'cert.pem',
    'logFileDir': '.logs',
    'menuFile': 'menu.json',
    'hashingSecret': 'its mueller time',
    'stripeAuth': 'pk_test_XCSJuxN5skNFYXbNFIDYQzrg',
    'MailGunAuth': 'api:9360d92eb59751ba7ee57b703874a45f-4836d8f5-3b70b722',
    'MailGunPath': 'sandboxc43f6407d8d948d7bbe87a8b40236a3c'
  },
  // production environment
  production: {
    'envName': 'production',
    'debug': false,
    'httpPort': 5000,
    'httpsPort': 5001,
    'UseHttps': true,
    'keyFile': 'key.pem',
    'certFile': 'cert.pem',
    'logFileDir': '.logs',
    'menuFile': '.db/menu/menu.json',
    'hashingSecret': 'impeach 45',
    'stripeAuth': 'pk_test_XCSJuxN5skNFYXbNFIDYQzrg',
    'MailGunAuth': 'api:9360d92eb59751ba7ee57b703874a45f-4836d8f5-3b70b722',
    'MailGunPath': 'sandboxc43f6407d8d948d7bbe87a8b40236a3c'
  }
};

// environment passed in on the cmd line
const currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// if the env passed in is valid use it otherwise use staging
const envToExport = typeof (environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

//export environment
module.exports = envToExport;
