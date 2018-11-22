'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

/**
 * @todo see if it is worth making the order structure compatible with the menu collection
 *@todo move checkout functionality to this and make it a form
 *@todo add ability to delete an entry and return to order form to add another entry
 *@todo make the toppings look like part of the pizza order
 *@todo add error status to this form and status of the order has it been submitted yet for payment.
*/

export function displayOrderSummary(app) {

    let orderSummaryHtml = document.querySelector(".orderSummaryData");
    if (orderSummaryHtml) {

        let replaceSpaces = new RegExp(' ', 'g');

        const previousOrder = app.session.getPreviousOrder();
        const prevOrderCollection = previousOrder.prevBasket;

        const formattedTotal = app.session.getFormattedTotal(previousOrder.prevTotal);
        const formattedTotalQuantity = app.session.getFormattedTotalQuantity(previousOrder.prevTotalQuantity);

        let htmlData = '';

        const header = `
        <div class="floatLeft borderBottom orderSummaryWrapper"><div class="orderSummaryInputHeader">Delete</div><div class="orderSummaryItem">Order Item</div><div class="orderSummaryDesc">Description</div><div class="orderSummaryQuantity">Order Quantity</div><div class="orderSummaryPrice">Order Price</div><div class="orderSummaryTotal">Total Price</div></div>`;

        const footer = `
        <div class="floatLeft marginBottom borderTop orderSummaryWrapper"><div class="orderSummaryInput"><input type="button" name="deleteAll" value="All" class="cta brown"></div><div class="orderSummaryItem">Delete All</div><div class="orderSummaryDesc"></div><div class="orderSummaryQuantity">${formattedTotalQuantity}</div><div class="orderSummaryPrice"></div><div class="orderSummaryTotal">${formattedTotal}</div></div>`;

        if (prevOrderCollection) {
            htmlData = header;
            for (let orderGroup of prevOrderCollection) {
                const orderGroupArray = orderGroup.orderGroup;
                for (let orderItem of orderGroupArray) {
                    htmlData += `
                    <div class="floatLeft orderSummaryWrapper"><div class="orderSummaryInput"><input type="button" name="${orderItem.item}_${(orderItem.description).replace(replaceSpaces, '_')}" value="X" class="cta brown"></div><div class="orderSummaryItem">${orderItem.item}</div><div class="orderSummaryDesc">${orderItem.description}</div><div class="orderSummaryQuantity">${orderItem.quantity}</div><div class="orderSummaryPrice">${orderItem.price}</div><div class="orderSummaryTotal">$${orderItem.total}.00</div></div>`;
                }
            }
            htmlData += footer;
        }
        orderSummaryHtml.innerHTML = htmlData;
    }
}
