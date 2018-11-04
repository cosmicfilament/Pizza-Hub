'use strict';

/**
    * @file loads a customizable list of menu items
    * @module menuConfig.js
    * @exports menuConfig
    * @todo wrap in try/catch
*/

const helpers = require('./../../utils/helpers');
const logs = require('./../../utils/logs');
const fs = require('fs');

const menuConfig = {};

menuConfig.menu = [];

menuConfig.load = (builder) => {

    // read in the menu
    const menuBuffer = fs.readFileSync(`${builder.getDir('configuration')}/menuConfig.json`);

    if (!helpers.validateObject(menuBuffer)) {
        logs.log('Could not parse the menu configuration file. Aborting ....');
        helpers.log('red', 'Could not parse the menu configuration file. Aborting ....');
        return false;
    }
    menuConfig.menu = JSON.parse(menuBuffer);
    return true;
};

menuConfig.getMenu = () => {
    return menuConfig.menu;
};

module.exports = menuConfig;
