'use strict';

/**
    * @file loads a customizable list of order items
    * @module orderBuilder.js
    * @exports orderBuilder
    * @todo wrap in try/catch
*/

const helpers = require('../../utils/helpers');
const logs = require('../../utils/logs');
const { MenuCollection } = require('../../Models/menuCollection');

const orderBuilder = {};

orderBuilder.buildOrder = function (templateFactory) {

    let result = false;
    let orderTemplate = buildOrderTemplate(templateFactory);

    if (helpers.validateString(orderTemplate)) {
        // this is the order html template that we will build the order on
        let htmlContainer = templateFactory.getTemplate('orderCreateFrm');

        if (helpers.validateString(htmlContainer)) {

            htmlContainer = htmlContainer.replace('@@@orderGroups@@@', orderTemplate);

            // set the input control type to number for each number input control in the order
            let strToFind = new RegExp('@@number@@', 'g');
            htmlContainer = htmlContainer.replace(strToFind, 'number" min="0" max="10" value="0" placeholder="10');
            // set the input control type to button for each button input control in the order
            strToFind = new RegExp('@@button@@', 'g');
            htmlContainer = htmlContainer.replace(strToFind, 'button');

            // resave the order html template fully populated
            templateFactory.setTemplate('basketCreateFrm', htmlContainer);
            result = true;
        }
    }
    if (result) {
        logs.log('Order and Order Form templates Loaded.');
    }
    return result;
};

const buildOrderTemplate = function (templateFactory) {

    // create an orderCollection array of objects from the menuConfig json file
    const orderCollection = new MenuCollection(templateFactory.getMenuFile());
    let orderTemplate = '';
    // iterates thru the groups populating the order template with the
    // individual groups that make up the order.
    for (let orderGroup of orderCollection) {
        // better be an object with properties
        if (helpers.validateArray(orderGroup)) {

            let htmlGroup = templateFactory.getTemplate('orderGroup');
            let item_0 = '';

            // iterate thru the items populating the orderItem template with
            // the items that make up each group and choices that make up each item.
            let items = '';
            let strToFind = '';
            for (let item of orderGroup) {
                if (helpers.validateObject(item)) {

                    let htmlItem = templateFactory.getTemplate('orderItem');
                    let itemValue = item.item;
                    // make the legend of the fieldset the order item value
                    // suppress the display of the same value in the orderItem.html
                    if (!helpers.validateString(item_0)) {
                        item_0 = item.item;
                        itemValue = '';
                    }
                    htmlItem = htmlItem.replace('@@orderItem@@', itemValue);

                    let choices = '';
                    for (let choice of item.choices) {
                        if (helpers.validateObject(choice)) {
                            let htmlChoice = templateFactory.getTemplate('orderChoice');

                            // find the spaces in the string and replace with underscore
                            // inputName is the name of the form input control
                            strToFind = new RegExp(' ', 'g');
                            strToFind = choice.desc.replace(strToFind, '_');
                            htmlChoice = htmlChoice.replace('@@inputName@@', strToFind);

                            strToFind = '@@desc@@';
                            htmlChoice = htmlChoice.replace(strToFind, choice.desc);

                            htmlChoice = htmlChoice.replace('@@price@@', choice.price);
                            choices += htmlChoice;
                        }
                    }
                    // add the collection of choices to the html
                    htmlItem = htmlItem.replace('@@@orderChoices@@@', choices);
                    items += htmlItem;
                }
            }
            strToFind = new RegExp('@@orderItem_0@@', 'g');
            htmlGroup = htmlGroup.replace(strToFind, item_0);
            htmlGroup = htmlGroup.replace('@@@orderItems@@@', items);
            orderTemplate += htmlGroup;
        }
    }
    return orderTemplate;
};

module.exports = orderBuilder;
