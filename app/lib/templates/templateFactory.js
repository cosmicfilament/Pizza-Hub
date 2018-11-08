'use strict';

/**
    * @file populates the templates in the templates directory with the contents of the menuConfig file and the siteConfig file.
    * @module templateFactory.js
    * @exports
*/

const menuConfig = require('./menuConfig');
const templates = require('./templates');
const siteConfig = require('./siteConfig');
const helpers = require('./../../utils/helpers');
const logs = require('./../../utils/logs');
const { MenuCollection } = require('./../../Models/menuCollection');

const templateFactory = {};

// holds the location for each html template file
const htmlTemplatesDirectory = new Map();
let theApp = {};

templateFactory.init = async function (app) {

    theApp = app;

    htmlTemplatesDirectory.set('templates', `${app.getBaseDir()}/templates`);
    htmlTemplatesDirectory.set('layout', `${app.getBaseDir()}/templates/layout`);
    htmlTemplatesDirectory.set('configuration', `${app.getBaseDir()}/configuration`);

    if (! await templateFactory.rebuildTemplates()) {
        logs.log('Shutting down app in templateFactory rebuildTemplates. Aborting ....', 'b');
        app.shutdown(1);
    }
    return true;
};

templateFactory.buildLayout = () => {

    // json file of objects with properties
    const jsonFile = siteConfig.getSiteConfigFile();
    // map of html layout which have placeholders for key and property name
    let htmlString = templates.layout;
    // for each key in the jsonFile file
    for (let key in jsonFile) {
        // if the value of the key is a string try to match
        // if (helpers.validateString(jsonFile[key])) {
        //     let strToFind = `@@${key}@${_key}@@`;
        //     strToFind = new RegExp(strToFind, 'g');
        // }
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
    // this is the menu html template that we will build the menu on
    let menuHtml = templates.getTemplate('menu');
    // json config file that has the menu selections, choices and pricing
    const menuConfigSelections = new MenuCollection(menuConfig.getMenu());
    let firstTimeIn = true;
    // for each selection in the menu (menu item)
    for (let selection of menuConfigSelections) {
        // better be an object with properties
        if (helpers.validateObject(selection)) {
            // break at each selection
            if (!firstTimeIn && selection.parent === true) {
                menuHtml += '</br>';
            }
            firstTimeIn = false;
            // get the selection html template and populate it
            let selectionHtml = templates.getTemplate('menuSelection');
            selectionHtml = selectionHtml.replace('@@item@@', selection.item);
            menuHtml += `\n${selectionHtml}`;
            // a selection can have more than 1 choice so iterate the choices
            let choices = selection.choices;
            // a choice would be like 8"(choice) or 12"(choice) pizza(selection)
            for (let choice of choices) {
                if (helpers.validateObject(choice)) {
                    // populate the choice html template
                    let choiceHtml = templates.getTemplate('menuChoice');
                    choiceHtml = choiceHtml.replace('@@desc@@', choice.desc);
                    choiceHtml = choiceHtml.replace('@@price@@', choice.price);
                    menuHtml += `\n${choiceHtml}`;
                }
            }
        }
    }
    // resave the menu html template fully populated
    templates.setTemplate('menu', menuHtml);
    return true;
};

templateFactory.addBodyToLayout = (page, strHtml) => {
    // get the html layout template
    let layout = templates.getLayOut();
    // update the body class on the layout template
    let strToFind = '@@body@class@@';
    layout = layout.replace(strToFind, page);
    // find the body placeholder
    strToFind = '@@@body@@@';
    // replace it with the html string
    layout = layout.replace(strToFind, strHtml);
    return layout;
};

templateFactory.getHtmlTemplatesDirectory = (str) => {
    return htmlTemplatesDirectory.get(str);
};

templateFactory.getTemplate = (str) => {
    return templates.getTemplate(str);
};

templateFactory.rebuildTemplates = async function () {
    // load the menu config json file
    let result = await menuConfig.load(templateFactory);
    // load all of the html templates
    result = result && await templates.load(templateFactory);
    // load the siteConfig json file
    result = result && await siteConfig.load(templateFactory);
    // iterate thru the layouts and add the site Config data
    result = result && templateFactory.buildLayout();
    // build the menu page from the menu config json and
    // the menu, selection and choice templates
    result = result && templateFactory.buildMenu();

    if (result) {
        logs.log('Templates loaded.');
        return true;
    }
    return false;
};

templateFactory.getTheApp = () => {
    return theApp;
};

module.exports = templateFactory;
