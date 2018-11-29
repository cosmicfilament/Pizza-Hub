'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

/**
    * @file
    * @module
    * @exports
*/
export function BasketObj() {
    this._basketId = '';
    this._phone = '';
    this._orderCollection = null;
}

BasketObj.prototype.getBasketId = function () {
    return this._basketId;
};

BasketObj.prototype.createBasketId = function (app) {
    if (this._phone.length !== enums.PHONE_NUMBER_LENGTH) {
        this._phone = app.session.getPhone();
    }
    this._basketId = this.createUniqueId();
    return this;
};

BasketObj.prototype.setPhone = function (phone) {
    this._phone = phone;
    return this;
};

BasketObj.prototype.getPhone = function () {
    return this._phone;
};

BasketObj.prototype.addItemToOrderCollection = function (item) {
    this._orderCollection.set(item.id, item);
    return this;
};

BasketObj.prototype.getItemFromOrderCollection = function (id) {
    return this._orderCollection.get(id);
};

BasketObj.prototype.deleteItemFromOrderCollection = function (id) {
    return this._orderCollection.delete(id);
};

BasketObj.prototype.updateOrderCreateFrm = function (app, reset = false) {
    if (reset) {
        const numberInputs = document.querySelectorAll("input[type='number']");
        for (let input of numberInputs) {
            input.value = 0;
        }
        const childNumberInputs = document.querySelectorAll(".multiChildInput");
        for (let input of childNumberInputs) {
            input.firstChild.disabled = true;
        }
    }
    const orderTotal = document.querySelector(".orderTotal");
    orderTotal.innerHTML = this.getFormattedTotalPrice();

    const cartStatus = document.querySelector(".cartStatus");
    cartStatus.innerHTML = this.getFormattedTotalQuantity();

    const logo = document.querySelector(".logo");
    logo.scrollIntoView();
};

BasketObj.prototype.getFormattedTotalPrice = function () {

    let total = helpers.validateObject(this._orderCollection) ? this._orderCollection.getTotalPrice() : 0;
    total = helpers.validateIntegerRange(total) ? total : 0;

    return helpers.createFormattedTotalPrice(total);
};

BasketObj.prototype.getFormattedTotalQuantity = function () {
    let total = helpers.validateObject(this._orderCollection) ? this._orderCollection.getTotalQuantity() : 0;
    total = helpers.validateIntegerRange(total) ? total : 0;

    return helpers.createFormattedTotalQuantity(total);
};

BasketObj.prototype.createUniqueId = function (somePhoneNumber = '') {

    if (somePhoneNumber === '') {
        somePhoneNumber = this._phone;
    }
    return this._basketId = `${somePhoneNumber}_${helpers.createUniqueId()}`;
};

BasketObj.prototype.getNewBasketFromFrm = function (app) {

    this._orderCollection = new _mc.smartMap();

    this.createBasketId(app);

    this._orderCollection.setId(this.getBasketId());
    this._orderCollection.setPhone(this.getPhone());

    // array of groups === fieldsets same as menuCollection
    const fieldSets = document.getElementsByClassName("orderGroup");
    // collection
    if (helpers.validateHtmlCollection(fieldSets)) {

        // group -- this is what we are looking for at the top level
        for (let orderGroup of fieldSets) {

            if (helpers.validateHtmlElement(orderGroup)) {

                // basketItem may or may not be saved depending on if the
                // item has a valid choice collection
                const basketItem = _mc.ItemFactory();
                const itemName = orderGroup.querySelector("legend").textContent;

                basketItem.id = this.createUniqueId();
                basketItem.item = itemName;

                // we are going to create an array of item(s) with choice(s)
                const items = orderGroup.getElementsByClassName("orderItemCollection");
                if (helpers.validateHtmlCollection(items)) {

                    for (let index = 0; index < items.length; index++) {
                        const _item = items[index];
                        if (helpers.validateHtmlElement(_item)) {

                            let choiceQty = 0;

                            const numberInput = _item.querySelector("input[type='number']");
                            if (helpers.validateHtmlElement(numberInput)) {
                                if (numberInput.value > 0) {
                                    choiceQty = Number(numberInput.value);
                                }
                            }

                            // each item has a collection of one or more choices
                            const choices = _item.getElementsByClassName("choiceWrapper");
                            if (helpers.validateHtmlCollection(choices)) {

                                for (let choiceWrapper of choices) {
                                    if (helpers.validateHtmlElement(choiceWrapper)) {
                                        // choice
                                        const input = choiceWrapper.querySelector("input");

                                        const choice = _mc.ChoiceFactory();

                                        choice.desc = choiceWrapper.querySelector(".choiceDesc").textContent;
                                        choice.price = choiceWrapper.querySelector(".choicePrice").textContent;
                                        choice.id = this.createUniqueId();

                                        if (helpers.validateHtmlElement(input)) {
                                            if (input.type === 'number' && input.value > 0) {

                                                choice.quantity = Number(input.value);
                                                choice.totalPrice = Number(choice.quantity) * parseFloat(choice.price.substring(1));

                                                basketItem.totalPrice += Number(choice.totalPrice);
                                                basketItem.totalQuantity += Number(choice.quantity);

                                                basketItem.choices.push(choice);

                                            } else if (input.type === 'radio' && input.checked === true) {

                                                choice.quantity = Number(choiceQty);
                                                choice.totalPrice = Number(choice.quantity) * parseFloat(choice.price.substring(1));

                                                basketItem.totalPrice += Number(choice.totalPrice);
                                                basketItem.totalQuantity += Number(choice.quantity);

                                                basketItem.choices.push(choice);
                                            }
                                        }
                                    } // end of choice
                                } // end of choices
                            } // end of choices
                        }
                    } // end of item
                    if (basketItem.totalQuantity > 0 && basketItem.totalPrice > 0 && basketItem.choices.length > 0 && basketItem.id) {

                        this._orderCollection.MapSet(basketItem.id, basketItem);

                        let totalQty = this._orderCollection.getTotalQuantity();
                        totalQty += basketItem.totalQuantity;
                        this._orderCollection.setTotalQuantity(totalQty);

                        let totalPrice = this._orderCollection.getTotalPrice();
                        totalPrice += basketItem.totalPrice;
                        this._orderCollection.setTotalPrice(totalPrice);
                    }
                } // end of item
            }
        } // end of iterating thru the order Groups and adding to the map
        const newBasket = (this._orderCollection.getTotalQuantity() > 0) ? this._orderCollection.stringify() : false;

        //@todo think about saving the state of the form
        if (helpers.validateObject(newBasket)) {
            localStorage.setItem('savedBasketId', this._orderCollection.id);
            return newBasket;
        }

    } // end of iterating thru the order Groups and adding to the map
    return false;
};


BasketObj.bindRadioSelectButtons = function () {

    const radioInputs = document.querySelectorAll("input[type='radio']");
    for (let radio of radioInputs) {

        // and add an eventlistener to their submit button, binding it to this function
        radio.addEventListener("click", () => {

            // re-enable the child number inputs once a selection is made
            const childNumberInputs = document.querySelectorAll(".multiChildInput");
            for (let input of childNumberInputs) {
                input.firstChild.disabled = false;
            }
        });

    }
};
