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

const Basket = function () {
    this.item = '';
    this.quantity = 0;
    this.description = '';
    this.price = 0.00;
    this.total = 0.00;
};

export function updateOrderCreateFrm(app, reset = false) {

    if (reset) {
        const numberInputs = document.querySelectorAll("input[type='number']");
        for (let input of numberInputs) {
            input.value = 0;
        }
    }
    const orderTotal = document.querySelector(".orderTotal");
    orderTotal.innerHTML = app.session.getFormattedBasketTotal();

    const cartStatus = document.querySelector(".cartStatus");
    cartStatus.innerHTML = app.session.getFormattedBasketTotalQuantity();
}

export function bindAddToBasketButtons(app) {

    const addToBasketButtons = document.getElementsByClassName("addToBasket");
    for (let button of addToBasketButtons) {
        button.addEventListener("click", (e) => {

            e.preventDefault();
            // groupName is the classname on the fieldset that encapsulates one whole order selection. The name field on the button is set to be the same as the classname on the fieldset by the server module orderBuilder.js
            const groupName = button.name;

            const fieldset = document.querySelector(`.${groupName}`);
            const orderItemCollection = fieldset.querySelectorAll(".orderItemCollection");

            const basketGroup = [];
            const basketCollection = [];

            for (let index = 0; index < orderItemCollection.length; index++) {
                const orderItem = orderItemCollection[index];

                const radioInputs = orderItem.querySelectorAll("input[type='radio']");
                const orderChoicesCollection = orderItem.querySelector(".orderChoicesCollection").children;

                const itemName = fieldset.querySelector("legend").textContent;

                // single number input for quantity of the selection, selection is selected by a radio input and should
                // then contain and additional order item below it that allows you to select ingredients or options
                if (radioInputs.length > 0) {

                    const quantity = orderItem.querySelector(".QtyWhenRadioButtonSelectEnabled").firstElementChild.value;
                    for (let choice of orderChoicesCollection) {
                        const radioInput = choice.querySelector("input[type='radio']:checked");
                        if (radioInput !== null) {
                            const basket = new Basket();
                            basket.item = itemName;
                            basket.quantity = quantity;
                            basket.description = choice.querySelector(".choiceDesc").textContent;
                            basket.price = choice.querySelector(".choicePrice").textContent;
                            basket.total = Number(basket.quantity) * parseFloat(basket.price.substring(1));

                            if (basket.quantity > 0) {
                                basketCollection.push(basket);
                            }
                        }
                    }
                } else { //if (index > 0) {
                    for (let choice of orderChoicesCollection) {
                        const qty = choice.querySelector("input[type='number']").value;
                        if (qty > 0) {
                            const basket = new Basket();
                            basket.quantity = qty;
                            basket.description = choice.querySelector(".choiceDesc").textContent;
                            basket.item = index > 0 ? `${itemName} option:` : itemName;
                            basket.price = choice.querySelector(".choicePrice").textContent;
                            basket.total = Number(basket.quantity) * parseFloat(basket.price.substring(1));

                            if (basket.quantity > 0) {
                                basketCollection.push(basket);
                            }
                        }
                    }
                }
            }
            if (basketCollection.length > 0) {
                basketGroup.push({
                    "orderGroup": basketCollection
                });
                app.session.addToBasket(basketGroup);
                updateOrderCreateFrm(app, true);
            }
        }); //add eventListener
    } // for button of addToBasketButtons
}
