'use strict';

/**
    * @module templates.js
*	 @exports templates
*/

const fs = require('fs');
const helpers = require('./../../utils/helpers');
const logs = require('./../../utils/logs');

const templates = {};

// template map read from the templates directorys
templates.templateMap = new Map();
templates.layout = '';
templates.menu = '';

templates.load = (builder) => {

    try {
        // read the template directory contents (file names) as an array
        const templateFileNames = fs.readdirSync(builder.getDir('templates'));

        if (!helpers.validateObject(templateFileNames)) {
            logs.log('Could not read the templates directory.');
            throw ('Could not read the templates directory.');
        }
        // iterate thru the array setting file name less extension to key and file contents to value in the map
        templateFileNames.forEach(templateFileName => {

            const stats = fs.statSync(`${builder.getDir('templates')}/${templateFileName}`);

            // if is a directory then process the layout which are in a subdirectory
            if (!stats.isDirectory()) {

                let templateData = fs.readFileSync(`${builder.getDir('templates')}/${templateFileName}`);
                templateData = templateData.toString();

                // iterate thru the templates saving each one to the map
                if (!helpers.validateString(templateData, 0, '>')) {
                    logs.log(`Error reading the template ${templateFileName}.`);
                    throw (`Error reading the template ${templateFileName}.`);
                }
                templateFileName = templateFileName.replace('.html', '');

                if (templateFileName === 'menu') {
                    templates.menu = templateData;
                }
                else {
                    // add templateName and template data to the map.
                    templates.templateMap.set(templateFileName, templateData);
                }
            }
            else {

                let layoutFileName = fs.readdirSync(builder.getDir('layout'));

                if (!helpers.validateObject(layoutFileName)) {
                    logs.log('Could not read the layout template directory.');
                    throw ('Could not read the layout template directory.');
                }

                let layoutData = fs.readFileSync(`${builder.getDir('layout')}/${layoutFileName[0]}`);
                layoutData = layoutData.toString();

                if (!helpers.validateString(layoutData)) {
                    logs.log(`Error reading the layout template ${layoutFileName[0]}.`);
                    throw (`Error reading the layout template ${layoutFileName[0]}.`);
                }
                // set the layout to the file data
                templates.layout = layoutData;
            }
        });
    }
    catch (error) {
        logs.log(`try/catch error thrown reading the templates and layout directories. Reason: ${error}. Aborting....`);
        helpers.log('red', `try/catch error thrown reading the templates and layout directories. Reason: ${error}. Aborting....`);
        return false;
    }

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

templates.getMenu = () => {
    return templates.menu;
};

module.exports = templates;
