'use strict';

/**
    * @module templates.js
*	 @exports templates
*/

const fs = require('fs');
const helpers = require('./../../utils/helpers');
const logs = require('./../../utils/logs');
const files = require('./../../utils/files');

const templates = {};

// template map read from the templates directorys
templates.templateMap = new Map();
templates.layout = '';

templates.load = async function (templateFactory) {

    // read the template directory contents (file names) as an array
    const templateFileNames = await files.readDirectory(templateFactory.getHtmlTemplatesDirectory('templates'));

    if (!helpers.validateObject(templateFileNames)) {
        logs.log('Could not read the templates directory.');
        return false;
    }

    // iterate thru the array setting file name less extension to key and file contents to value in the map
    for (let templateFileName of templateFileNames) {

        const stats = await files.statP(`${templateFactory.getHtmlTemplatesDirectory('templates')}/${templateFileName}`);

        // if is a directory then process the layout which are in a subdirectory
        if (!stats.isDirectory()) {

            let templateData = await files.readFileAsUtf8(`${templateFactory.getHtmlTemplatesDirectory('templates')}/${templateFileName}`);
            templateData = templateData.toString();

            // iterate thru the templates saving each one to the map
            if (!helpers.validateString(templateData)) {
                logs.log(`Error reading the template ${templateFileName}.`);
                return false;
            }
            templateFileName = templateFileName.replace('.html', '');
            // add templateName and template data to the map.
            templates.templateMap.set(templateFileName, templateData);
        }
        else {

            let layoutFileName = await files.readDirectory(templateFactory.getHtmlTemplatesDirectory('layout'));

            if (!helpers.validateObject(layoutFileName)) {
                logs.log('Could not read the layout template directory.');
                return false;
            }

            let layoutData = await files.readFileAsUtf8(`${templateFactory.getHtmlTemplatesDirectory('layout')}/${layoutFileName[0]}`);
            layoutData = layoutData.toString();

            if (!helpers.validateString(layoutData)) {
                logs.log(`Error reading the layout template ${layoutFileName[0]}.`);
                return false;
            }
            // set the layout to the file data
            templates.layout = layoutData;
        }
    };
    //
    return true;
};

templates.getTemplate = (key) => {
    return templates.templateMap.get(key);
};

templates.setTemplate = (key, value) => {
    templates.templateMap.set(key, value);
};

templates.getLayOut = () => {
    return templates.layout;
};

module.exports = templates;
