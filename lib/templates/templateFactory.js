'use strict';

/**
    * @file populates the templates in the templates directory with the contents of the menuConfig file and the siteConfig file.
    * @module templateFactory.js
    * @exports
    * @ todo revisit the dirs and see if it is actually needed or move to app
*/

const menuConfig = require('./menuConfig');
const templates = require('./templates');
const siteConfig = require('./siteConfig');
const helpers = require('./../../utils/helpers');
const { MenuCollection } = require('./../../Models/menuCollection');

const templateFactory = {};

// holds base directories - helper function
const dirs = new Map();

templateFactory.init = (app) => {

    dirs.set('templates', `${app.getBaseDir()}/templates`);
    dirs.set('layout', `${app.getBaseDir()}/templates/layout`);
    dirs.set('configuration', `${app.getBaseDir()}/configuration`);

    // load the menu params
    if (menuConfig.load(templateFactory) &&
        // load the templates
        templates.load(templateFactory) &&
        // load the template params
        siteConfig.load(templateFactory) &&
        // iterate thru the layouts and add the canned data
        templateFactory.buildLayout() &&
        // build the menu page
        templateFactory.buildMenu()) {
        return true;
    }
    // if any step fails then shutdown gracefully
    app.shutdown(1);
};

templateFactory.buildLayout = () => {

    // json file of objects with properties
    const jsonFile = siteConfig.getSiteConfigFile();
    // map of html layout which have placeholders for key and property name
    let layout = templates.layout;
    let htmlString = layout;
    // for each key in the jsonFile file
    for (let key in jsonFile) {
        // if the value of the key is a string try to match
        if (helpers.validateString(jsonFile[key])) {
            let strToFind = `@@${key}@${_key}@@`;
            strToFind = new RegExp(strToFind, 'g');
        }
        // if the value of the key is an object
        if (helpers.validateObject(jsonFile[key])) {
            let obj = jsonFile[key];
            // iterate thru its properties
            for (let _key in obj) {
                //try to match to the html file
                let strToFind = `@@${key}@${_key}@@`;
                strToFind = new RegExp(strToFind, 'g');
                htmlString = htmlString.replace(strToFind, obj[_key]);
            }
        }
    }
    templates.layout = htmlString;
    return true;
};

templateFactory.buildMenu = () => {

    let homeHtml = templates.getTemplate('home');
    const menus = new MenuCollection(menuConfig.getMenu());
    let firstTimeIn = true;

    for (let selection of menus) {
        if (helpers.validateObject(selection)) {
            // break at each selection
            if (!firstTimeIn && selection.parent === true) {
                homeHtml += '</br>';
            }
            firstTimeIn = false;

            let selectionHtml = templates.getTemplate('selection');
            selectionHtml = selectionHtml.replace('@@item@@', selection.item);
            homeHtml += `\n${selectionHtml}`;

            let choices = selection.choices;
            for (let choice of choices) {
                if (helpers.validateObject(choice)) {
                    let choiceHtml = templates.getTemplate('choice');
                    choiceHtml = choiceHtml.replace('@@desc@@', choice.desc);
                    choiceHtml = choiceHtml.replace('@@price@@', choice.price);
                    homeHtml += `\n${choiceHtml}`;
                }
            }
        }
    }
    templates.setTemplate('home', homeHtml);
    return true;
};

templateFactory.addBodyToLayout = (strHtml) => {

    let layout = templates.getLayOut();
    let strToFind = '@@@body@@@'
    layout = layout.replace(strToFind, strHtml);
    return layout;
}

templateFactory.getDir = (str) => {
    return dirs.get(str);
};

templateFactory.getTemplate = (str) => {
    return templates.getTemplate(str);
};

module.exports = templateFactory;
