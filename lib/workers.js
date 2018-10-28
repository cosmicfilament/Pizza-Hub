'use strict';

/**
  * @file workers module that runs a couple of timers that purge stale tokens and rotates the logs once daily
  * @module workers.js
  * @description worker kind of sort of process within the node loop. Fires timers to process intermittent tasks
*/

const { Token } = require('./../Models/tokenModel');
const fDb = require('./fileDb');
const logs = require('./../utils/logs');

const workers = {};
/**
 * @summary cleanupExpiredTokens function
 * @description Purges the expired tokens every 90 seconds
*/
workers.cleanupExpiredTokens = async function () {

  const listOfTokens = await fDb.list('token').catch((error) => {
    console.log('\x1b[31m%s', `error listing the tokens for delete: ${error}`);
  });

  if (helpers.validateObject(listOfTokens)) {
    for (let token of listOfTokens) {
      let tknObj = await fDb.read('token', token).catch((error) => {
        console.log('\x1b[31m%s', `error reading the token for delete: ${token}. Reason: ${error}`);
      });

      tknObj = Token.clone(tknObj);
      if (tknObj.validateTokenExpiration() !== true) {
        helpers.log('blue', `Deleting token: ${token}`);
        await fDb.delete('token', token).catch((error) => {
          console.log('\x1b[31m%s', `error listing the tokens for delete: ${error}`);
        });
      }
    }
  }
};

/**
 * @summary rotateLogs
 * @description Rotates (compresses) the log files
*/
workers.rotateLogs = async function () {
  // List all the (non compressed) log files

  // grab today's log file name
  const dateNow = new Date(Date.now());
  const todaysLogs = `${dateNow.getFullYear()}${dateNow.getMonth() + 1}${dateNow.getDate()}`;

  return logs.list(false)
    .then((list) => {
      if (list) {
        list.forEach(async fileName => {
          // only compress previous day's log file
          if (fileName !== todaysLogs) {
            const logId = fileName.replace('.log', '');
            const newLogId = fileName.replace('.log', `-${Date.now()}`);
            // compress the new log
            let result = await logs.compress(logId, newLogId);
            if (!result) {
              return console.log('\x1b[31m%s', `Error compressing file: ${newLogId}`);
            }
            result = await logs.truncate(logId);
            if (!result) {
              return console.log('\x1b[31m%s', `Error truncating file: ${newLogId}`);
            }
          }
        });
      }
    })
    .then(() => {
      return helpers.log('green', 'Successfully rotated logs.');
    })
    .catch((err) => {
      console.log('\x1b[31m%s', `Rotating logs failed with error code: ${err}`);
    });
};

/**
 * @summary cleanupExpiredTokensLoop
 * @description Currently just purges the expired tokens every 10 minutes
*/
workers.cleanupExpiredTokensLoop = () => {
  setInterval(() => {
    workers.cleanupExpiredTokens();
  }, 1000 * 60 * 10);
};

/**
 * @summary logRotationLoop
 * @description Timer to execute the log-rotation process once per day
*/
workers.logRotationLoop = () => {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 10);
};
/**
 * @summary init
 * @description starts the worker loops
*/
workers.init = () => {

  helpers.log('blue', 'Background workers have started');

  workers.cleanupExpiredTokensLoop();

  //Call the compression loop once per day
  workers.logRotationLoop();
};

module.exports = workers;
