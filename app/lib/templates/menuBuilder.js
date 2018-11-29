'use strict';

/**
 * @file loads a customizable list of menu items
 * @module menuBuilder.js
 * @exports menuBuilder
 * @todo wrap in try/catch
 */

const helpers = require('./../../public/js/common/helpers');
const logs = require('../../utils/logs');
const { smartCollection } = require('../../public/js/common/smartCollection')._mc;

const menuBuilder = {};

menuBuilder.buildMenu = function (templateFactory) {

    let result = false;
    let menuTemplate = buildMenuTemplate(templateFactory);

    if (helpers.validateString(menuTemplate)) {
        // this is the menu html template that we will build the menu on
        let htmlContainer = templateFactory.getTemplate('menu');

        if (helpers.validateString(htmlContainer)) {

            htmlContainer = htmlContainer.replace('@@@menuGroups@@@', menuTemplate);
            // resave the menu html template fully populated
            templateFactory.setTemplate('menu', htmlContainer);
            result = true;
        } else {
            result = false;
        }
    }
    if (result) {
        logs.log('Menu templates loaded.');
    }
    return result;
};

const buildMenuTemplate = function (templateFactory) {

    // turn the menuConfig.json file into a collection object
    const menuFile = templateFactory.getMenuFile();
    const menuCollection = smartCollection(menuFile);

    let menuTemplate = '';
    // iterates thru the groups populating the menu template with the
    // individual groups that make up the menu.
    for (let menuGroup of menuCollection) {
        // better be an object with properties
        if (helpers.validateArray(menuGroup)) {

            let htmlGroup = templateFactory.getTemplate('menuGroup');

            // iterate thru the items populating the menuItem template with
            // the items that make up each group and choices that make up each item.
            let items = '';
            let strToFind = '';
            for (let item of menuGroup) {
                if (helpers.validateObject(item)) {

                    let htmlItem = templateFactory.getTemplate('menuItem');
                    strToFind = new RegExp('@@menuItem@@', 'g');
                    htmlItem = htmlItem.replace(strToFind, item.item);

                    // iterate thru the choices populating the menuChoice template
                    // with the description and price, then add that to the choices string
                    // to build the html
                    let choices = '';
                    for (let choice of item.choices) {
                        if (helpers.validateObject(choice)) {
                            let htmlChoice = templateFactory.getTemplate('menuChoice');

                            strToFind = '@@desc@@';
                            htmlChoice = htmlChoice.replace(strToFind, choice.desc);

                            htmlChoice = htmlChoice.replace('@@price@@', choice.price);
                            choices += htmlChoice;
                        }
                    }
                    htmlItem = htmlItem.replace('@@@menuChoices@@@', choices);
                    items += htmlItem;
                }
            }
            htmlGroup = htmlGroup.replace('@@@menuItems@@@', items);
            menuTemplate += htmlGroup;
        }
    }
    return menuTemplate;
};

module.exports = menuBuilder;
