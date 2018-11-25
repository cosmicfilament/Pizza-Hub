'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

const Item = function () {
    this.id = '';
    this.item = '';
    //    this.totalQuantity = 0;
    //    this.totalPrice = 0;
    this.choices = [];
};

const Choice = function () {
    //    this.id = '';
    this.desc = '';
    this.price = 0;
    //    this.quantity = 0;
    //    this.total = 0;
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

export function getNewOrderFromForm() {

    // array of 3 order groups
    const fieldSetCollection = document.getElementsByClassName("orderGroup");

    const orderGroupCollection = fieldSetCollection.querySelectorAll(".orderItemCollection");

    for (let orderGroup of orderGroupCollection) {
        // set the parent order item

        // get the order item collection
        for (let orderItem of orderGroup) {
            // item has a item prop and a select prop
            // save the properties and then get the choices

            for (let choice of orderItem.choices) {
                // number input choice

                // radio button choice

                //save choice to the collection that belongs to the parent item
            }
            // save all of the choices to the item

        }
        // save the item(s) to the collection
    }

    return false;
}
