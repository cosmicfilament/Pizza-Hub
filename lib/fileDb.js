'use strict';

/*
*
* file system data store using async/await
*
*/

const helpers = require('./helpers');
const path = require('path');
const { promisify } = require('util');
const { open, close, ftruncate, readFile, writeFile, unlink, readdir } = require('fs');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const ftruncateFileP = promisify(ftruncate);
//const truncateFileP = promisify(truncate);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const deleteFileP = promisify(unlink);
const readDirP = promisify(readdir);
//const appendFileP = promisify(appendFile);

const lib = {};

// base directory of data folder
const baseDir = path.join(__dirname, '/../.db');
// current directory or target directory
const makeDir = (dir) => {
    return `${baseDir}/${dir}/`;
}
// file in current or target directory
const makeFName = (dir, fName) => {
    return `${baseDir}/${dir}/${fName}.json`;
};

/**
    * Asynchronously creates a file in a directory that must already havve been created.
    * @async
    * @param dir The directory where the file will be located.
    * @param file The file name for the new file
    * @param data JSON object
    * @returns sucess message or false
    */
lib.create = async function (dir, file, data) {

    const fName = makeFName(dir, file);

    const fd = await openFileP(fName, 'wx');
    await writeFileP(fd, JSON.stringify(data));
    await closeFileP(fd);
    return true;

};

/**
    * Asynchronously reads a file
    * @async
    * @param dir The directory where the file is located.
    * @param file The file name
    * @returns a JSON object or false
    */
lib.read = async function (dir, file) {

    const fName = makeFName(dir, file);

    const data = await readFileP(fName, 'utf8');
    return helpers.parseJsonToObject(data);
};

/**
     * Asynchronously updates an existing file
    * @async
    * @param dir The directory where the file is located.
    * @param file The file name
    * @param data JSON object
    * @returns success message or false
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
    * Asynchronously deletes an existing file
    * @async
    * @param dir The directory where the file is located.
    * @param file The file name to delete
    * @returns true or false
    */
lib.delete = async function (dir, file) {

    const fName = makeFName(dir, file);

    await deleteFileP(fName);
    return true;
};

/**
    * Asynchronously returns a list of all files in a directory
    * @async
    * @param dir The directory where the file is located.
    * @returns array of file names or false
    */
lib.list = async function (dir) {

    const _dir = makeDir(dir);

    const inFiles = await readDirP(_dir);
    const outFiles = [];
    if (helpers.validateArray(inFiles)) {
        inFiles.reduce((outFiles, currFile) => {
            outFiles.push(currFile.replace('.json', ''));
        });
        return outFiles;
    }
    return false;
};

module.exports = lib;
