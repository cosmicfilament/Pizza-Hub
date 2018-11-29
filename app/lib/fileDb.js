'use strict';

/**
 * @file fileDb module crud file functions that use fs functions wrapped in promises. Acts like a database for the application
 * @module fileDb.js
 * @description Basic flat file CRUD functions
 * @exports create
 * @exports read
 * @exports update
 * @exports delete
 * @exports list
 */

const { promisify } = require('util');
const { open, close, ftruncate, readFile, writeFile, unlink, readdir } = require('fs');
const helpers = require('./../public/js/common/helpers');
const { BASE_DIR, CONFIG } = require('./config');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const ftruncateFileP = promisify(ftruncate);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const deleteFileP = promisify(unlink);
const readDirP = promisify(readdir);

const lib = {};

// base directory of data folder
const baseDir = `${BASE_DIR}/${CONFIG.dbFileDir}`;
// current directory or target directory
const makeDir = (dir) => {
    return `${baseDir}/${dir}/`;
};

// file in current or target directory
const makeFName = (dir, fName) => {
    return `${baseDir}/${dir}/${fName}.json`;
};

/**
 * @async
 * @summary lib.create function
 * @description Asynchronously creates a file in a directory that must already havve been created.
 * @param dir The directory where the file will be located.
 * @param file The file name for the new file
 * @param data JSON object
 * @returns sucess message or false
 * @throws there is no error trapping in this function.
 */
lib.create = async function (dir, file, data) {

    const fName = makeFName(dir, file);

    const fd = await openFileP(fName, 'wx');
    await writeFileP(fd, JSON.stringify(data));
    await closeFileP(fd);
    return true;

};

/**
 * @description Asynchronously reads a file
 * @async
 * @param dir The directory where the file is located.
 * @param file The file name
 * @returns a JSON object or false
 * @throws there is no error trapping in this function.
 */
lib.read = async function (dir, file) {

    const fName = makeFName(dir, file);

    const data = await readFileP(fName, 'utf8');
    return helpers.parseJsonToObject(data);
};

/**
 * @description  Asynchronously updates an existing file
 * @async
 * @param dir The directory where the file is located.
 * @param file The file name
 * @param data JSON object
 * @returns success message or false
 * @throws there is no error trapping in this function.
 */
lib.update = async function (dir, file, data) {

    const fName = makeFName(dir, file);

    const fd = await openFileP(fName, 'r+');
    await ftruncateFileP(fd);
    await writeFileP(fd, JSON.stringify(data));
    await closeFileP(fd);
    return true;

};

/**
 * @description Asynchronously deletes an existing file
 * @async
 * @param dir The directory where the file is located.
 * @param file The file name to delete
 * @returns true or false
 * @throws there is no error trapping in this function.
 */
lib.delete = async function (dir, file) {

    const fName = makeFName(dir, file);

    await deleteFileP(fName);
    return true;
};

/**
 * @description Asynchronously returns a list of all files in a directory
 * @async
 * @param dir The directory where the file is located.
 * @returns array of file names or false
 * @throws there is no error trapping in this function.
 */
lib.list = async function (dir) {

    const _dir = makeDir(dir);

    const inFiles = await readDirP(_dir);
    const outFiles = [];

    if (helpers.validateArray(inFiles)) {
        // inFiles.forEach(async file => {
        //   outFiles.push(file.replace('.json', ''));
        // });
        for (let file of inFiles) {
            await outFiles.push(file.replace('.json', ''));
        }
        return outFiles;
    }
    return false;
};

module.exports = lib;
