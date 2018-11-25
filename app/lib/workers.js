'use strict';

/**
 * @file workers module that runs a couple of timers that purge stale tokens and rotates the logs once daily
 * @module workers.js
 * @description worker kind of sort of process within the node loop. Fires timers to process intermittent tasks
 */

const {
    Token
} = require('./../Models/tokenModel');
const fDb = require('./fileDb');
const logs = require('./../utils/logs');
const helpers = require('./../public/js/common/helpers');

const workers = {};
/**
 * @summary cleanupExpiredTokens function
 * @description Purges the expired tokens every 90 seconds
 */
workers.cleanupExpiredTokens = async function () {

    const listOfTokens = await fDb.list('token').catch((error) => {
        helpers.log('red', `error listing the tokens for delete: ${error}`);
        return false;
    });

    if (helpers.validateObject(listOfTokens)) {
        for (let token of listOfTokens) {
            let tknObj = await fDb.read('token', token).catch((error) => {
                helpers.log('red', `error reading the token for delete: ${token}. Reason: ${error}`);
            });

            tknObj = Token.clone(tknObj);
            if (tknObj.validateTokenExpiration() !== true) {
                helpers.log('green', `Deleting token: ${token}`);
                await fDb.delete('token', token).catch((error) => {
                    helpers.log('red', `error deleting the token:${token}. Reason: ${error}`);
                });
            }
        }
        return true;
    }
    return false;
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

    const fileList = await logs.list(false).catch(() => {
        return false;
    });
    logs.log('Calling rotateLogs.', 'b', 'green');
    if (fileList) {
        for (let fileName of fileList) {
            // only compress previous day's log file
            if (fileName !== todaysLogs) {
                const logId = fileName.replace('.log', '');
                const newLogId = fileName.replace('.log', `-${Date.now()}`);
                // compress the new log
                let result = await logs.compress(logId, newLogId).catch(() => {
                    return false;
                });
                // delete the old log file
                if (result) {
                    result = await logs.delete(logId).catch(() => {
                        return false;
                    });
                } else {
                    helpers.log('red', `Rotating logs failed for file: ${fileName}`);
                }
                if (result) {
                    helpers.log('green', `Successfully rotated file: ${fileName}`);
                }
            } // end if
        } // end for of
    } // end if
    return true;
};

/**
 * @summary cleanupExpiredTokensLoop
 * @description Currently just purges the expired tokens every 10 minutes
 */
workers.cleanupExpiredTokensLoop = () => {
    setInterval(() => {
        workers.cleanupExpiredTokens();
        logs.log('Cleanup expired tokens called.', 'b', 'green');
    }, 1000 * 60 * 60);
};

/**
 * @summary logRotationLoop
 * @description Timer to execute the log-rotation process once per day. Runs every 5 minutes and checks the time. Hey what do you want?
 */
workers.logRotationLoop = () => {
    setInterval(() => {
        return workers.rotateLogs()
            .catch((err) => helpers.log('red', `Log rotation failed with error: ${err}`));

    }, 1000 * 60 * 5);
};
/**
 * @summary init
 * @description starts the worker loops
 */
workers.init = () => {

    logs.log('Background workers have started', 'b', 'blue');

    // purge expired tokens
    workers.cleanupExpiredTokensLoop();

    //Call the log compression loop
    workers.logRotationLoop();
};

module.exports = workers;
