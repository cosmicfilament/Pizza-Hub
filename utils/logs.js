'use strict';

/**
* @file file logging functions
* @module logs.js
* @description functions for loggin and compressing and uncompressing log files
* @exports logs
*/

const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const { open, close, truncate, readFile, writeFile, readdir, appendFile } = require('fs');
const config = require('./../lib/config');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const truncateFileP = promisify(truncate);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const readDirP = promisify(readdir);
const appendFileP = promisify(appendFile);

/**
* @summary gzipP function
* @description promisified gzip function for zipping log files
* @param file and data
* @returns gzipped buffer
* @throws promise reject
*/
const gzipP = function (file, data) {
    return new Promise((resolve, reject) => {
        zlib.gzip(data, (err, buffer) => {
            if (!buffer) {
                reject(`Error: Nothing to compress in file: ${file}.`);
            }
            if (err) {
                reject(`Error zipping file: ${file}. ${err}`);
            }
            if (buffer) {
                resolve(buffer);
            }
        });
    });
};
/**
* @summary unzipP
* @description promisified unzip function for unzipping logs
* @param zipped data
* @returns uzipped data in a buffer
* @throws promise reject
*/
const unzipP = function (sourceData) {
    return new Promise((resolve, reject) => {
        const inBuffer = Buffer.from(sourceData, 'base64');
        zlib.unzip(inBuffer, (err, outBuffer) => {
            if (!outBuffer) {
                reject('Error: Nothing to decompress in zipped file.');
            }
            if (err) {
                reject(`Error unzippin file. ${err}`);
            }
            if (outBuffer) {
                resolve(outBuffer.toString());
            }
        });
    });
};

const logs = {};

// Base directory of data folder
const baseDir = path.join(__dirname, '/../.logs/');
// current directory or target directory
const getDir = () => {
    return `${baseDir}/`;
};

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
logs.append = (file, str) => {

    const fName = makeFName(file);
    let _fd = -1;
    // open file for appending
    return openFileP(fName, 'a')
        .then((fd) => {
            _fd = fd;
            // append log entry to the file
            return appendFileP(_fd, `${str}\n`);
        })
        .then(() => { //close file
            closeFileP(_fd);
            return true;
        })
        .catch((err) => { // squash any errors
            console.log('\x1b[31m%s', `Error appending to log file: ${file}. ${err}`);
            return false;
        });
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
    let logData = await readDirP(getDir()).catch((err) => {
        console.log('\x1b[31m%s', `Error reading list of log files. ${err}`);
        return false;
    });

    let trimmedFileNames = [];
    if (logData) {
        for (let fileName of logData) {
            if (fileName) {
                //slurp up the log files
                if (fileName.indexOf('.log') > -1) {
                    await trimmedFileNames.push(fileName.replace('.log', ''));
                }
                else if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    //gobble up the zipped files too
                    await trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }
            }
        }
    }
    // returns list of file names if true and false if empty
    //return helpers.validateArray(trimmedFileNames);
    return trimmedFileNames ? trimmedFileNames : [];
};

/**
* @summary compress
* @description compresses logfiles
* @param logFile and new logFile
* @returns status
* @throws nothing
*/
logs.compress = (logId, newFileId) => {
    const sourceFile = makeFName(logId);
    const destFile = makeFName(newFileId, false);
    let _sourceDataZipped = '';
    let _fd = -1;

    return readFileP(sourceFile, 'utf8')
        .then((sourceData) => {
            return gzipP(sourceFile, sourceData);
        })
        .then((sourceDataZipped) => {
            _sourceDataZipped = sourceDataZipped;
            return openFileP(destFile, 'wx');
        })
        .then((fd) => {
            _fd = fd;
            return writeFileP(_fd, _sourceDataZipped.toString('base64'));
        })
        .then(() => {
            return closeFileP(_fd);
        })
        .then(() => {
            return true;
        })
        .catch((err) => {
            console.log('\x1b[31m%s', `Error compressing log file: ${err}`);
            return false;
        });
};
/**
* @summary decompress
* @description decompresses an already compressed log file
* @param file id
* @returns uncompressed data in a string
* @throws nothing
*/
logs.decompress = (fileId) => {
    const file = makeFName(fileId);

    return readFileP(file, 'utf8')
        .then((sourceData) => {
            return unzipP(sourceData);
        })
        .then((str) => {
            return str;
        })
        .catch((err) => {
            console.log('\x1b[31m%s', err);
            return false;
        });
};
/**
* @summary truncate
* @description truncates a log file
* @param log file id
* @returns status
* @throws nothing
*/
logs.truncate = (logId) => {
    return truncateFileP(makeFName(logId))
        .then(() => {
            return true;
        })
        .catch((err) => {
            console.log('\x1b[31m%s', `Error truncating log file: ${logId}. ${err}`);
            return false;
        });
};

/**
* @summary log
* @description logs colored messages to the console and/or to the logfile
* @param color and message
*/
logs.logToFile = (logData) => {

    const timeNow = new Date(Date.now());
    // Convert the data to a string
    const logString = `${timeNow.toLocaleTimeString('en-US')}:: ${logData}`;

    // Determine the name of the currently active log file
    const logFileName = `${timeNow.getFullYear()}${timeNow.getMonth() + 1}${timeNow.getDate()}`;

    // pop this new entry onto the current log file.
    return logs.append(logFileName, logString).catch((err) => {
        console.log('\x1b[31m%s', `Logging to file failed with error code: ${err}`);
    });
};

module.exports = logs;
