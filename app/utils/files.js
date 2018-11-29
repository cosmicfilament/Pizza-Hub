'use strict';

/**
 * @file files module that provides common async file functions
 * @module files.js
 * @exports files
 */


const {
    promisify
} = require('util');
const { open, close, ftruncate, readFile, writeFile, unlink, readdir, access, stat } = require('fs');
const { F_OK, R_OK, W_OK } = require('constants');

const { BASE_DIR } = require('../lib/config');
const debug = require('util').debuglog('files');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const ftruncateFileP = promisify(ftruncate);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const deleteFileP = promisify(unlink);
const readDirP = promisify(readdir);
const accessP = promisify(access);
const statP = promisify(stat);

// @todo pull out the string from the stack only with this file name in it
class FilesError {
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

const files = {};

// builds an absolute path to a directory
files.makeDir = (dir) => {
    return `${BASE_DIR}/${dir}`;
};

// builds an absolute path to a file
files.makeFName = (dir, fName) => {
    return `${files.makeDir(dir)}/${fName}`;
};

/**
 * @async
 * @summary files.openFile function
 * @description Asynchronously opens a file for reading. By default it opens for reading and appending and creates the file if it does not exist. See Nodejs documentation for File System Flags.
 * @param absoluteFilePath
 * @param flags
 * @returns file descriptor or false on fail
 */
files.openFile = async function (absoluteFilePath, flags = 'a+') {

    let result = await openFileP(absoluteFilePath, flags).catch((error) => {
        return new FilesError(error.stack, `Error opening the file: ${error.message}`, module.parent).debug();
    });
    return result;
};

/**
 * @async
 * @summary Asynchronously closes a file
 * @description files.closeFile function which closes a file when passed a file descriptor
 * @param fd
 * @returns true or false
 */
files.closeFile = async function (fd) {

    await closeFileP(fd).catch((error) => {
        return new FilesError(error.stack, `Error closing the file: ${error.message}`, module.parent).debug();
    });
    return true;
};

/**
 * @async
 * @summary Asynchronously truncates a file
 * @description files.truncateFile function. implements ftruncate
 * @param fd
 * @returns true or false
 */
files.truncateFile = async function (fd) {

    await ftruncateFileP(fd).catch((error) => {
        return new FilesError(error.stack, `Error truncating the file: ${error.message}`, module.parent).debug();
    });
    return true;
};

/**
 * @async
 * @summary Asynchronously reads an entire file as a utf8 string.
 * @description files.readFileAsUtf8 function. Reads the file and returns a utf8 string
 * @param absoluteFilePath
 * @returns string or false;
 */
files.readFileAsUtf8 = async function (absoluteFilePath) {

    let str = await readFileP(absoluteFilePath, 'utf8').catch((error) => {
        return new FilesError(error.stack, `Error reading the file: ${error.message}`, module.parent).debug();
    });
    return str;
};

/**
 * @async
 * @summary Asynchronously reads an entire file as a buffer
 * @description files.readFileBuffer function which returns a buffer.
 * @param absoluteFilePath
 * @param options
 * @returns buffer or false
 */
files.readFileBuffer = async function (absoluteFilePath) {

    let buffer = await readFileP(absoluteFilePath).catch((error) => {
        return new FilesError(error.stack, `Error reading the file: ${error.message}`, module.parent).debug();
    });
    return buffer;
};

/**
 * @async
 * @summary Asynchronously writes an entire file encoded as a utf8 string
 * @description files.writeFile function which writes string data to a file. The file is truncated if it exists or created if it does not exist.
 * @param absoluteFilePath
 * @param options
 * @returns buffer or false
 */
files.writeFile = async function (absoluteFilePath) {

    await writeFileP(absoluteFilePath).catch((error) => {
        return new FilesError(error.stack, `Error writing to the file: ${error.message}`, module.parent).debug();
    });
    return true;
};

/**
 * @async
 * @summary Asynchronously deletes a file
 * @description files.deleteFile function which deletes (unlinks) a file.
 * @param absoluteFilePath
 * @returns true or false
 */
files.deleteFile = async function (absoluteFilePath) {

    await deleteFileP(absoluteFilePath).catch((error) => {
        return new FilesError(error.stack, `Error deleting the file: ${error.message}`, module.parent).debug();
    });
    return true;
};

/**
 * @async
 * @summary Asynchronously reads a file directory
 * @description files.readDirectory function which reads an entire directory as an array of strings
 * @param absoluteDirectoryPath
 * @returns true or false
 */
files.readDirectory = async function (absoluteDirectoryPath) {

    let strArray = await readDirP(absoluteDirectoryPath).catch((error) => {
        return new FilesError(error.stack, `Error reading the directory: ${error.message}`, module.parent).debug();
    });
    return strArray;
};

/**
 * @async
 * @summary Asynchronously checks if a file or directory exists or is accessible
 * @description files.isAccessible function which checks if a file or directory exists or conversely if you have permission to access it.
 * @param absolutePath
 * @returns true or false
 */
files.isAccessible = async function (absolutePath) {

    await accessP(absolutePath, F_OK | R_OK | W_OK).catch((error) => {
        return new FilesError(error.stack, `Error accessing the file: ${error.message}`, module.parent).debug();
    });
    return true;
};
/**
 * @async
 * @summary Asynchronously checks if a file or directory exists or is accessible
 * @description files.isAccessible function which checks if a file or directory exists or conversely if you have permission to access it.
 * @param absolutePath
 * @returns true or false
 */
files.statP = async function (absolutePath) {

    let stats = await statP(absolutePath).catch((error) => {
        return new FilesError(error.stack, `Error getting stats for the file: ${error.message}`, module.parent).debug();
    });
    return stats;
};

module.exports = files;
