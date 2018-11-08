'use strict';

/**
    * @module siteConfig.js
    * @description reads in the siteConfig.json file
    * @exports siteConfig
    * @todo wrap in try/catch
*/

const helpers = require('./../../utils/helpers');
const logs = require('./../../utils/logs');
const files = require('./../../utils/files');

const siteConfig = {};

let siteConfigFile = [];

siteConfig.load = async function (templateFactory) {

    // read in the templateConfigFile
    const templateString = await files.readFileAsUtf8(`${templateFactory.getHtmlTemplatesDirectory('configuration')}/siteConfig.json`);

    if (!helpers.validateString(templateString)) {
        logs.log('Could not parse the site Setup configuration file.');
        return false;
    }
    siteConfigFile = JSON.parse(templateString)

    return true;
};

siteConfig.getSiteConfigFile = () => {
    return siteConfigFile;
};

module.exports = siteConfig;
