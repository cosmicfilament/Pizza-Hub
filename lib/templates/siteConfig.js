'use strict';

/**
    * @module siteConfig.js
    * @description reads in the siteConfig.json file
    * @exports siteConfig
    * @todo wrap in try/catch
*/

const helpers = require('../../utils/helpers');
const logs = require('../../utils/logs');
const fs = require('fs');

const siteConfig = {};

let siteConfigFile = [];

siteConfig.load = (builder) => {

    // read in the templateConfigFile
    const templateBuffer = fs.readFileSync(`${builder.getDir('configuration')}/siteConfig.json`);

    if (!helpers.validateObject(templateBuffer)) {
        logs.log('Could not parse the site Setup configuration file. Aborting ....');
        helpers.log('red', 'Could not parse the site Setup configuration file. Aborting ....');
        return false;
    }
    siteConfigFile = JSON.parse(templateBuffer);
    return true;
};

siteConfig.getSiteConfigFile = () => {
    return siteConfigFile;
};

module.exports = siteConfig;
