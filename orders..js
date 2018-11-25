'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

/**
 * @todo see if it is worth making the order structure compatible with the menu collection
 *@todo move checkout functionality to the summary and make it a form
 *@todo add ability to delete an entry in the summary and return to this order form to add another entry
 *@todo make the toppings look like part of the pizza order in the json
 *@todo add error status to this form
 */

const Header = function () {
    this.basketName = 'ORDER_HEADER';
    this.basketId = '';
    this.phone = '';
    this.basketTotalQuantity = 0;
    this.basketTotalPrice = 0;
};

const Group = function () {
    this.id = '';
    this.name = '';
    this.totalQuantity = 0;
    this.totalPrice = 0;
    this.items = [];
};

const Item = function () {
    this.id = '';
    this.item = '';
    this.totalQuantity = 0;
    this.totalPrice = 0;
    this.choices = [];
};

const Choice = function () {
    this.id = '';
    this.desc = '';
    this.price = 0;
    this.quantity = 0;
    this.total = 0;
};


export function updateOrderCreateFrm(app, reset = false) {

    if (reset) {
        const numberInputs = document.querySelectorAll("input[type='number']");
        for (let input of numberInputs) {
            input.value = 0;
        }
    }
    const orderTotal = document.querySelector(".orderTotal");
    orderTotal.innerHTML = getFormattedTotalPrice();

    const cartStatus = document.querySelector(".cartStatus");
    cartStatus.innerHTML = getFormattedTotalQuantity();
}

export function getFormattedTotalPrice() {
    let total = localStorage.getItem("orderTotalPrice");
    total = helpers.validateIntegerRange(total) ? total : 0;
    return `${total} items in basket.`;
}

export function getFormattedTotalQuantity() {
    let total = localStorage.getItem("orderTotalQuantity");
    total = helpers.validateIntegerRange(total) ? total : 0;
    return `Total: $${total}.00`;
}

export function getNewOrderFromForm(app) {

    const header = new Header();
    header.basketId = helpers.createUniqueId();
    header.phone = app.session.getPhone();

    // array of groups === fieldsets same as menuCollection
    const fieldSets = document.getElementsByClassName("orderGroup");
    // collection
    if (helpers.validateHtmlCollection(fieldSets)) {

        const orderColl = [];
        orderColl.totalQuantity = 0;
        orderColl.totalPrice = 0;

        for (let orderGroup of fieldSets) {
            if (helpers.validateHtmlElement(orderGroup)) {
                // group
                const itemName = orderGroup.querySelector("legend").textContent;

                const group = new Group();
                group.id = helpers.createUniqueId();
                group.name = itemName;

                const items = orderGroup.getElementsByClassName("orderItemCollection");
                if (helpers.validateHtmlCollection(items)) {
                    // for (let item of items) {
                    for (let index = 0; index < items.length; index++) {
                        const _item = items[index];
                        if (helpers.validateHtmlElement(_item)) {
                            // item
                            const collectionItem = new Item();
                            let choiceQty = 0;

                            const numberInput = _item.querySelector("input[type='number']");
                            if (helpers.validateHtmlElement(numberInput) && numberInput.value > 0) {

                                collectionItem.id = helpers.createUniqueId();
                                collectionItem.item = itemName;
                                choiceQty = Number(numberInput.value);
                            }
                            // choices
                            const choices = _item.getElementsByClassName("choiceWrapper");
                            if (helpers.validateHtmlCollection(choices)) {
                                for (let choiceWrapper of choices) {
                                    if (helpers.validateHtmlElement(choiceWrapper)) {
                                        // choice
                                        const input = choiceWrapper.querySelector("input");
                                        if (helpers.validateHtmlElement(input)) {
                                            if (input.type === 'number' && input.value > 0) {
                                                const choice = new Choice();

                                                choice.id = helpers.createUniqueId();
                                                choice.desc = choiceWrapper.querySelector(".choiceDesc").textContent;
                                                choice.price = choiceWrapper.querySelector(".choicePrice").textContent;
                                                choice.quantity = Number(input.value);
                                                collectionItem.totalQuantity += Number(choice.quantity);
                                                choice.total = Number(choice.quantity) * parseFloat(choice.price.substring(1));
                                                collectionItem.totalPrice += Number(choice.total);

                                                collectionItem.choices.push(choice);

                                            } else if (input.type === 'radio' && input.checked === true) {
                                                const choice = new Choice();

                                                choice.id = helpers.createUniqueId();
                                                choice.desc = choiceWrapper.querySelector(".choiceDesc").textContent;
                                                choice.price = choiceWrapper.querySelector(".choicePrice").textContent;
                                                choice.quantity = Number(choiceQty);
                                                collectionItem.totalQuantity += Number(choice.quantity);
                                                choice.total = Number(choice.quantity) * parseFloat(choice.price.substring(1));
                                                collectionItem.totalPrice += Number(choice.total);

                                                collectionItem.choices.push(choice);
                                            }
                                        }
                                    } // end of choice
                                }
                                if (collectionItem.totalQuantity > 0) {
                                    group.totalPrice += Number(collectionItem.totalPrice);
                                    group.totalQuantity += Number(collectionItem.totalQuantity);
                                    group.items.push(collectionItem);
                                } // end of choices

                            } // end of item
                        }
                    } // end of items
                    if (group.totalQuantity > 0) {
                        orderColl.push(group);

                        header.basketTotalQuantity += group.totalQuantity;
                        header.basketTotalPrice += group.totalPrice;
                    }
                } // end of a group
            }
        } // end of one order
        if (helpers.validateArray(orderColl) && header.basketTotalQuantity > 0) {
            orderColl.unshift(header);
            const smartColl = _mc.smartMenuCollection(orderColl, helpers.createUniqueId());
            const smartCollString = smartColl; //JSON.stringify(smartColl);

            localStorage.setItem('orderId', header.id);
            localStorage.setItem('orderCollection', smartCollString);
            localStorage.setItem('orderTotalQuantity', header.totalQuantity);
            localStorage.setItem('orderTotalPrice', header.totalPrice);

            return smartCollString;
        }
    }
    return false;
}
