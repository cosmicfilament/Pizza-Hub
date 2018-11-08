
'use strict';

/**
    * @file files module that provides common async file functions
    * @module files.js
    * @exports files
*/


const { promisify } = require('util');
const { open, close, ftruncate, readFile, writeFile, unlink, readdir, access } = require('fs');
const { BASE_DIR } = require('./app/lib/config');
const debug = require('util').debuglog('files');
const files = require('./');

// fs functions converted from node callback to promises
const openFileP = promisify(open);
const closeFileP = promisify(close);
const ftruncateFileP = promisify(ftruncate);
const readFileP = promisify(readFile);
const writeFileP = promisify(writeFile);
const deleteFileP = promisify(unlink);
const readDirP = promisify(readdir);
const accessP = promisify(access);

class FilesError {
    constructor(stack, message, parent) {
        this.stack = stack;
        this.message = message;
        this.parent = parent;
    }
    debug() {
        debug(`Stack: ${this.stack}\n\nMessage: ${this.message}\n\nParent: ${this.parent}\n`);
        return this;
    }
}

const files = {};

// builds an absolute path to a directory
files.makeDir = (dir) => {
    return `${BASE_DIR}/${dir}`;
};

// builds an absolute path to a file
files.makeFName = (dir, fName) => {
    return `${makeDir(dir)}/${fName}`;
};

files.openFile = async function (absoluteFilePath, flags = 'a+') {

    let result = await openFileP(absoluteFilePath, flags).catch((error) => {
        const fErr = new FilesError(error.stack, `Error opening the file: ${error.message}`, module.parent);
        return fErr.debug();
    });
    return result;
};

files.main = async function () {
    let output = await files.openFile(process.argv[2], 'r+');
    if (typeof (output) === 'object') {
        //console.log(`Stack: ${output.stack}\n\nMessge: ${output.message}\n\nParent: ${output.parent}\n\n`);
        const err = output.debug();
        return err;
    }
    console.log(await files.readFileStr(process.argv[2]));
};

files.main();
