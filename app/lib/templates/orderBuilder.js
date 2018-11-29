'use strict';

/**
 * @file loads a customizable list of order items
 * @module orderBuilder.js
 * @exports orderBuilder
 * @todo wrap in try/catch
 */

const helpers = require('./../../public/js/common/helpers');
const logs = require('../../utils/logs');
const { smartCollection } = require('../../public/js/common/smartCollection')._mc;

const orderBuilder = {};

orderBuilder.buildOrder = function (templateFactory) {

    let result = false;
    //this function returns
    let orderTemplate = buildOrderTemplate(templateFactory);
    // let strToFind = '';

    if (helpers.validateString(orderTemplate)) {
        // this is the order html template that we will build the order on
        let htmlContainer = templateFactory.getTemplate('orderCreateFrm');

        if (helpers.validateString(htmlContainer)) {

            htmlContainer = htmlContainer.replace('@@@orderGroups@@@', orderTemplate);
            // resave the order html template fully populated
            templateFactory.setTemplate('orderCreateFrm', htmlContainer);
            result = true;
        }
    }
    if (result) {
        logs.log('Order Form template Loaded.');
    }
    return result;
};
//
const buildOrderTemplate = function (templateFactory) {
    // text that we are going to insert into input fields to turn the input into an number input vice radio input
    const numberInputType = 'number" min="0" max="10" value="0" placeholder="10';
    // replace spaces with underscores on any class or id fields we generate from menu items that might have more than one word in the item name
    let replaceSpaces = new RegExp(' ', 'g');

    // builds a collection object from the menuConfig json file
    const orderGroupCollection = new smartCollection(templateFactory.getMenuFile());

    // this will end up being the fully constructed html order form
    let completedOrderForm = '';

    // the completedOrderForm is the top level collection and
    // orderGroups are individual order item groupings
    for (let orderGroup of orderGroupCollection) {
        if (helpers.validateArray(orderGroup)) {
            // html template that corresponds to the orderGroup object
            let htmlorderGroupTemplate = templateFactory.getTemplate('orderGroup');
            // name of the first orderItem in the group, which is also
            // the name of the actual item we are ordering. any subsequent
            // items in that group are option choices for the parentOrderItem
            let parentOrderItem = '';
            let childOrderItem = false;
            // look on orderGroup.html and you will see where this goes.
            let orderItemCollection = '';

            // for the most part there is either one or two order (items)
            // per group. In our case all groups have one item except pizza
            // which has pizza size choices and a topping item with topping
            // choices
            for (let orderItem of orderGroup) {
                if (helpers.validateObject(orderItem)) {

                    let htmlOrderItemTemplate = templateFactory.getTemplate('orderItem');
                    // select field for this orderItem which tells us if the choices
                    // are going to be radio buttons or number inputs
                    let select = orderItem.select;

                    // the first item in the orderGroup collection is always the name
                    // of the actual order item

                    if (!helpers.validateString(parentOrderItem)) {
                        parentOrderItem = orderItem.item.replace(replaceSpaces, '_');

                    }
                    else {
                        childOrderItem = orderItem.item.replace(replaceSpaces, '_');
                    }

                    // if we are going to use radiobuttons for selections, then we
                    // also need an input to select the order quantity
                    if (select === 'single') {
                        htmlOrderItemTemplate = htmlOrderItemTemplate.replace('hidden', numberInputType);
                        htmlOrderItemTemplate = htmlOrderItemTemplate.replace('@@labelWhenRadioButtonSelectEnabled@@', ' Order Quantity');
                    } else {
                        // probably not needed but looks cleaner if we hide the name of the
                        // input as well as the type if we are not using radio buttons
                        htmlOrderItemTemplate = htmlOrderItemTemplate.replace('@@parentOrderItem@@', 'hidden');
                        htmlOrderItemTemplate = htmlOrderItemTemplate.replace('@@labelWhenRadioButtonSelectEnabled@@', '');
                    }
                    // look on the orderChoice.html template and you will see where this goes
                    let orderChoicesCollection = '';
                    for (let choice of orderItem.choices) {
                        if (helpers.validateObject(choice)) {
                            let htmlChoiceTemplate = templateFactory.getTemplate('orderChoice');
                            // if the orderItem whose choices we are iterating thru is a single
                            // selection type of orderItem like a pizza where you choose the size
                            // vs toppings where you can select multiple toppings
                            if (select === 'single') {
                                //set the input type to a radio button
                                htmlChoiceTemplate = htmlChoiceTemplate.replace('@@inputType@@', 'radio');
                                // set the name value on all choices to the same value so
                                // that they are grouped
                                htmlChoiceTemplate = htmlChoiceTemplate.replace('@@ButtonName@@', parentOrderItem);
                                // make the id the choice description
                                htmlChoiceTemplate = htmlChoiceTemplate.replace('@@id@@', choice.desc.replace(replaceSpaces, '_'));

                            } else {
                                // set the input control type to number if is multi select
                                htmlChoiceTemplate = htmlChoiceTemplate.replace('@@inputType@@', numberInputType);
                                // in this case we want a unique name for each number input
                                // so we use the choice description for name and id will be set to ''
                                htmlChoiceTemplate = htmlChoiceTemplate.replace('@@ButtonName@@', choice.desc.replace(replaceSpaces, '_'));
                                htmlChoiceTemplate = htmlChoiceTemplate.replace('@@id@@', ''); //choice.desc.replace(replaceSpaces, '_'));
                                if (childOrderItem !== false) {
                                    // initially disable it if this is a multi order and we are on the childOrderItem
                                    // the ChildInput class allows that to happen
                                    htmlChoiceTemplate = htmlChoiceTemplate.replace('choiceInput', 'choiceInput multiChildInput');
                                }
                            }
                            htmlChoiceTemplate = htmlChoiceTemplate.replace('@@desc@@', choice.desc);

                            htmlChoiceTemplate = htmlChoiceTemplate.replace('@@price@@', choice.price);
                            // add this choice to the collection of choices that are available
                            // for the current orderItem.
                            orderChoicesCollection += htmlChoiceTemplate;
                        } // end if
                    } // for choice of choices

                    // add the collection of choices to the html template for the current orderItem
                    htmlOrderItemTemplate = htmlOrderItemTemplate.replace('@@@orderChoicesCollection@@@', orderChoicesCollection);
                    // add the current order item to the collection of order items on the group
                    orderItemCollection += htmlOrderItemTemplate;
                }
            }
            //htmlGroup = htmlGroup.replace(strToFind, parentOrderItem);
            htmlorderGroupTemplate = htmlorderGroupTemplate.replace('@@@orderItemCollection@@@', orderItemCollection);
            completedOrderForm += htmlorderGroupTemplate;
            // at the orderGroup level for each group added to the collection we need
            // to make sure we set the parentOrderItem value because it changes for each
            // orderGroup
            completedOrderForm = completedOrderForm.replace(new RegExp('@@parentOrderItem@@', 'g'), parentOrderItem);
        }
    }
    return completedOrderForm;
};

module.exports = orderBuilder;
