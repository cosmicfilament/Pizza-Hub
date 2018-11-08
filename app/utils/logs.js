'use strict';

/**
* @file functions for logging and compressing and uncompressing log files
* @module logs.js
* @exports logs
*/

const zlib = require('zlib');
const { promisify } = require('util');
const { open, close, readFile, writeFile, readdir, appendFile, unlink } = require('fs');
const { BASE_DIR, CONFIG } = require('./../lib/config');
const debug = require('util').debuglog('logs');

// @todo pull out the string from the stack only with this file name in it
class LogError {
    constructor(stack, message, parent) {
        this.stack = stack;
        this.message = message;
        this.parent = parent;
    }
    debug() {
        debug(`Stack: ${this.stack}\n\nMessage: ${this.message}\n\nParent: ${this.parent}\n`);
        return false;
    }
}

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const deleteFileP = promisify(unlink);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const readDirP = promisify(readdir);
const appendFileP = promisify(appendFile);

const gzipP = promisify(zlib.gzip);
const unzipP = promisify(zlib.unzip);

const logs = {};

// log directory
const baseDir = `${BASE_DIR}/${CONFIG.logFileDir}`;

// file in current or target directory
const makeFName = (fName, logFile = true) => {
    if (logFile) {
        return `${baseDir}/${fName}.log`;
    }
    else {
        return `${baseDir}/${fName}.gz.b64`;
    }
};

/**
* @summary append
* @description appends to a log
* @param file and dir
* @returns status
* @throws nothing
*/
logs.append = async function (file, str) {

    const fName = makeFName(file);

    // open file for appending
    let fd = await openFileP(fName, 'a').catch(() => { return false; });
    // append log entry to the file
    await appendFileP(fd, `${str}\n`).catch(() => { return false; });

    await closeFileP(fd).catch(() => { return false; });

    return true;
};

/**
* @summary list function
* @description lists the logfile names
* @param boolean for list compressed files or not
* @returns list of log file names
* @throws nothing
*/
logs.list = async function (includeCompressedLogs) {

    //read the directory contents
    let logData = await readDirP(baseDir).catch((err) => {
        return new LogError(error.stack, `Error reading list of log files. ${err}`, module.parent).debug();
    });

    let trimmedFileNames = [];
    if (logData) {
        for (let fileName of logData) {
            if (fileName && fileName.indexOf('.log') > -1) {
                trimmedFileNames.push(fileName.replace('.log', ''));
            }
            else if (fileName && fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                //gobble up the zipped files too
                trimmedFileNames.push(fileName.replace('.gz.b64', ''));
            }
        } // end for
    } // end if
    // returns list of file names
    return trimmedFileNames ? trimmedFileNames : [];
};

/**
* @summary compress
* @description compresses logfiles
* @param logFile and new logFile
* @returns status
* @throws nothing
*/
logs.compress = async function (logId, newFileId) {

    const sourceFile = makeFName(logId);
    const destFile = makeFName(newFileId, false);

    let sourceData = await readFileP(sourceFile, 'utf8').catch(() => { return false; });

    let sourceDataZipped = await gzipP(sourceFile, sourceData).catch(() => { return false; });

    let fd = await openFileP(destFile, 'wx').catch(() => { return false; });

    await writeFileP(fd, sourceDataZipped.toString('base64')).catch(() => { return false; });

    await closeFileP(fd).catch(() => { return false; });

    return true;
};
/**
* @summary decompress
* @description decompresses an already compressed log file
* @param file id
* @returns uncompressed data in a string
* @throws nothing
*/
logs.decompress = async function (fileId) {

    const file = makeFName(fileId);

    const sourceData = await readFileP(file, 'utf8').catch(() => { return false; });

    return await unzipP(sourceData).catch(() => { return false; });
};

/**
* @summary delete
* @description deletes a log file
* @param log file id
* @returns status
* @throws nothing
*/
logs.delete = async function (logId) {
    return await deleteFileP(makeFName(logId)).catch(() => { return false; });
};

/**
* @summary logToFile
* @description logs to the logfile
* @param logData log message
* @param options 'f' - log to file, 'c' - log to console, 'b' - log to both
*/
logs.log = async function (logData, option = 'f', color = 'red') {

    const timeNow = new Date(Date.now());
    // Convert the data to a string
    const logString = `${timeNow.toLocaleTimeString('en-US')}: ${logData}`;

    if (option === 'c' || option === 'b') {
        logs.console(color, logString);
    }

    if (option === 'c') {
        return;
    }

    // Determine the name of the currently active log file
    const logFileName = `${timeNow.getFullYear()}${timeNow.getMonth() + 1}${timeNow.getDate()}`;

    // pop this new entry onto the current log file.
    let result = await logs.append(logFileName, logString).catch(() => result = false);
    if (!result) {
        return new LogError(error.stack, `Logging to ${logFileName} failed with error code: ${err}`, module.parent).debug();
    }
};

/**
* @summary log
* @description writes in color to the console in staqing mode only
* @param statusCode and message
* @returns object as JSON string
*/
logs.console = (color, msg) => {

    if (CONFIG.debug === true) {
        switch (color) {
            case 'red':
                color = '\x1b[31m%s';
                break;
            case 'green':
                color = '\x1b[32m%s';
                break;
            case 'blue':
                color = '\x1b[34m%s';
                break;
            case 'yellow':
                color = '\x1b[33m%s';
                break;
            case 'black':
                color = '\x1b[30m%s';
                break;
            case 'white':
                color = '\x1b[37m%s';
                break;
            case 'cyan':
                color = '\x1b[36m%s';
                break;
            case 'magenta':
                color = '\x1b[35m%s';
                break;
        }
        console.log(color, msg);
    }
};

module.exports = logs;
