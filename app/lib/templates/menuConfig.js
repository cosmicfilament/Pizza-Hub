'use strict';

/**
    * @file loads a customizable list of menu items
    * @module menuConfig.js
    * @exports menuConfig
    * @todo wrap in try/catch
*/

const helpers = require('./../../utils/helpers');
const logs = require('./../../utils/logs');
const files = require('./../../utils/files');

const menuConfig = {};

menuConfig.menu = [];

menuConfig.load = async function (templateFactory) {

    const menuString = await files.readFileAsUtf8(`${templateFactory.getHtmlTemplatesDirectory('configuration')}/menuConfig.json`);

    if (!helpers.validateString(menuString)) {
        logs.log('Could not parse the menu configuration file.');
        return false;
    }
    menuConfig.menu = (helpers.parseJsonToObject(menuString))['menuCollection'];

    return true;
};

menuConfig.getMenu = () => {
    return menuConfig.menu;
};

module.exports = menuConfig;
