'use strict';

/**
    * @file populates the templates in the templates directory with the contents of the menuBuilder file and the siteConfig file.
    * @module templateFactory.js
    * @exports
*/

const menuLoader = require('./menuLoader');
const menuBuilder = require('./menuBuilder');
const orderBuilder = require('./orderBuilder');
const templates = require('./templates');
const helpers = require('./../../utils/helpers');
const logs = require('./../../utils/logs');
const { siteConfig } = require('./../config').CONFIG;

const templateFactory = {};

// holds the location for each html template file
const htmlTemplatesDirectory = new Map();
let theApp = {};

templateFactory.init = async function (app) {

    theApp = app;

    htmlTemplatesDirectory.set('templates', `${app.getBaseDir()}/templates`);
    htmlTemplatesDirectory.set('layout', `${app.getBaseDir()}/templates/layout`);
    htmlTemplatesDirectory.set('menu', `${app.getBaseDir()}/configuration`);

    if (! await templateFactory.rebuildTemplates()) {
        logs.log('Shutting down app in templateFactory rebuildTemplates. Aborting ....', 'b');
        app.shutdown(1);
    }
    return true;
};
//builds the layout which is cached in the templates module
templateFactory.buildLayout = () => {

    // map of html layout which have placeholders for key and property name
    let htmlString = templates.getLayout();
    // for each key in the siteConfig object within the config.js file
    for (let key in siteConfig) {
        if (helpers.validateString(siteConfig[key])) {
            const val = siteConfig[key];
            //try to match to the html file
            let strToFind = `@@${key}@@`;
            strToFind = new RegExp(strToFind, 'g');
            htmlString = htmlString.replace(strToFind, val);
        }
    }
    templates.layout = htmlString;
    return true;
};

// builds the navigation div which is also cached in the templates module
templateFactory.buildNavigation = () => {
    // map of html file which have placeholders for key and property name
    let htmlString = templates.getTemplate('navigation');
    // for each key in the siteConfig object within the config.js file
    for (let key in siteConfig) {
        if (helpers.validateString(siteConfig[key])) {
            const val = siteConfig[key];
            //try to match to the html file
            let strToFind = `@@${key}@@`;
            strToFind = new RegExp(strToFind, 'g');
            htmlString = htmlString.replace(strToFind, val);
        }
    }
    templates.setTemplate('navigation', htmlString);
    return true;
};
// builds the title div which is also cached in the templates module
templateFactory.buildBodyTitle = () => {
    // map of html file which have placeholders for key and property name
    let htmlString = templates.getTemplate('title');
    // for each key in the siteConfig object within the config.js file
    for (let key in siteConfig) {
        if (helpers.validateString(siteConfig[key])) {
            const val = siteConfig[key];
            //try to match to the html file
            let strToFind = `@@${key}@@`;
            strToFind = new RegExp(strToFind, 'g');
            htmlString = htmlString.replace(strToFind, val);
        }
    }
    templates.setTemplate('title', htmlString);
    return true;
};

// builds the footer div which is also cached in the templates module
templateFactory.buildFooter = () => {
    // map of html file which have placeholders for key and property name
    let htmlString = templates.getTemplate('footer');
    // for each key in the siteConfig object within the config.js file
    for (let key in siteConfig) {
        if (helpers.validateString(siteConfig[key])) {
            const val = siteConfig[key];
            //try to match to the html file
            let strToFind = `@@${key}@@`;
            strToFind = new RegExp(strToFind, 'g');
            htmlString = htmlString.replace(strToFind, val);
        }
    }
    templates.setTemplate('footer', htmlString);
    return true;
};

// uses the layout as the html page and adds content within it
templateFactory.buildWebPage = (sectionBody, bodyClass, navigation = true, sectionTitle = true, footer = true) => {

    if (navigation === true) {
        navigation = templates.getTemplate('navigation');
    }
    if (sectionTitle === true) {
        sectionTitle = templates.getTemplate('title');
    }
    if (footer === true) {
        footer = templates.getTemplate('footer');
    }

    // get the html layout template
    let webPage = templates.getLayout();
    // add the body css class
    let strToFind = '@@bodyClass@@';
    webPage = webPage.replace(strToFind, bodyClass);
    // add the navigation
    strToFind = '@@@navigation@@@';
    webPage = webPage.replace(strToFind, navigation);
    // add the body title
    strToFind = '@@@sectionTitle@@@';
    webPage = webPage.replace(strToFind, sectionTitle);
    // then add the meat of the body
    strToFind = '@@@sectionBody@@@';
    webPage = webPage.replace(strToFind, sectionBody);
    // add the footer
    strToFind = '@@@footer@@@';
    webPage = webPage.replace(strToFind, footer);
    return webPage;
};

templateFactory.rebuildTemplates = async function () {
    // load the menu from the json file
    let result = await menuLoader.load(templateFactory);
    // load all of the html templates
    result = result && await templates.load(templateFactory);
    // add the site Config data to the layout and cache it
    result = result && templateFactory.buildLayout();
    // add the site Config data to the Navigation and oh yah cache it.
    result = result && templateFactory.buildNavigation();
    // add the site Config data to the bodyTitle and cache it
    result = result && templateFactory.buildBodyTitle();
    // add the site Config data to the footer and cache it
    result = result && templateFactory.buildFooter();
    // build the menu
    result = result && menuBuilder.buildMenu(templateFactory);
    // build the order
    result = result && orderBuilder.buildOrder(templateFactory);

    if (result) {
        logs.log('Templates loaded.');
        return true;
    }
    return false;
};

templateFactory.getHtmlTemplatesDirectory = (str) => {
    return htmlTemplatesDirectory.get(str);
};

templateFactory.getTemplate = (str) => {
    return templates.getTemplate(str);
};

templateFactory.setTemplate = (key, value) => {
    return templates.setTemplate(key, value);
};

templateFactory.getMenuFile = () => {
    return menuLoader.getMenuFile();
};

templateFactory.getTheApp = () => {
    return theApp;
};

module.exports = templateFactory;
