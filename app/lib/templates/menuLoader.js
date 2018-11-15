'use strict';

/**
    * @file loads a customizable list of menu items
    * @module menuLoader.js
    * @exports menuLoader
    * @todo wrap in try/catch
*/

const helpers = require('../../utils/helpers');
const logs = require('../../utils/logs');
const files = require('../../utils/files');

const menuLoader = {};

// private
let theMenuFile = [];

menuLoader.load = async function (templateFactory) {

    if (menuLoader.isMenuLoaded()) {
        return true;
    }

    const configFile = await files.readFileAsUtf8(`${templateFactory.getHtmlTemplatesDirectory('menu')}/menuConfig.json`);

    if (!helpers.validateString(configFile)) {
        logs.log('Could not parse the menu configuration file.');
        return false;
    }
    theMenuFile = (helpers.parseJsonToObject(configFile))['menuCollection'];

    return true;
};

menuLoader.isMenuLoaded = function () {
    return !!helpers.validateObject(theMenuFile);
};

menuLoader.getMenuFile = function () {
    return theMenuFile;
};

module.exports = menuLoader;
