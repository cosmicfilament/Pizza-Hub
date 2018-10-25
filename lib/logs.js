'use strict';

/*
*
* Library for log rotation
*
*/

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const helpers = require('./helpers');

const { promisify } = require('util');
const { open, close, ftruncate, truncate, readFile, writeFile, unlink, exists, readdir, appendFile } = require('fs');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
//const ftruncateFileP = promisify(ftruncate);
const truncateFileP = promisify(truncate);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
//const deleteFileP = promisify(unlink);
//const fileExistsP = promisify(exists);
const readDirP = promisify(readdir);
const appendFileP = promisify(appendFile);

const gzipP = function (data) {
    return new Promise((resolve, reject) => {
        zlib.gzip(data, (err, buffer) => {
            if (!buffer) {
                reject(`Error: Nothing to compress in file: ${file}.`)
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

const unzipP = function (sourceData) {
    return new Promise((resolve, reject) => {
        const inBuffer = Buffer.from(sourceData, 'base64');
        zlib.unzip(inBuffer, (err, outBuffer) => {
            if (!outBuffer) {
                reject(`Error: Nothing to decompress in zipped file.`)
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
}
// file in current or target directory
const makeFName = (fName, logFile = true) => {
    if (logFile) {
        return `${baseDir}/${fName}.log`;
    }
    else {
        return `${baseDir}/${fName}.gz.b64`;
    }
};

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
            helpers.log('red, '`Error appending to log file: ${file}. ${err}`);
            return false;
        });
};

logs.list = (includeCompressedLogs) => {

    //read the directory contents
    return readDirP(getDir())
        .then((data) => {
            let trimmedFileNames = [];
            if (helpers.validateObject(data)) {
                data.forEach((fileName) => {
                    //slurp up the log files
                    if (fileName.indexOf('.log') > -1) {
                        trimmedFileNames.push(fileName.replace('.log', ''));
                    }
                    if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                        //gobble up the zipped files too
                        trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                    }
                });
            }
            // returns list of file names if true and false if empty
            return helpers.validateArray(trimmedFileNames);
        })
        .catch((err) => {
            helpers.log('red', `Error listing log file. ${err}`);
            return false;
        });
};

logs.compress = (logId, newFileId) => {
    const sourceFile = makeFName(logId);
    const destFile = makeFName(newFileId, false);
    let _sourceDataZipped = '';
    let _fd = -1;

    return readFileP(sourceFile, 'utf8')
        .then((sourceData) => {
            return gzipP(sourceData);
        })
        .then((sourceDataZipped) => {
            _sourceDataZipped = sourceDataZipped;
            return openFileP(destFile, 'wx')
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
            helpers.log('red', `Error compressing log file: ${err}`);
            return false;
        });
};

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
            helpers.log(err)
            return false;
        })
};

logs.truncate = (logId) => {
    return truncateFileP(makeFName(logId))
        .then(() => {
            return true;
        })
        .catch((err) => {
            helpers.log('red', `Error truncating log file: ${logId}. ${err}`);
            return false;
        });
};

module.exports = logs;
