'use strict';
/* eslint no-console: off */

/**
 *
 *
 *
 */

import { RequestObj, xhrRequest } from './ajax.js';

export function SessionObj() {
    this._token = false;
    this._phone = '';
    this._name = '';
}

SessionObj.prototype.setToken = function (token) {
    this._token = token;
    return this;
};
SessionObj.prototype.getToken = function () {
    return this._token;
};

SessionObj.prototype.isTokenValid = function () {
    return (this._token !== false && typeof (this._token) === 'string' && this._token.length > 0) ? true : false;
};

SessionObj.prototype.setPhone = function (phone) {
    this._phone = phone;
    return this;
};
SessionObj.prototype.getPhone = function () {
    return this._phone;
};

SessionObj.prototype.setName = function (name) {
    this._name = name;
    return this;
};
SessionObj.prototype.getName = function () {
    return this._name;
};

// SessionObj.prototype.setBasket = function (basket) {
//     this._basket = basket;
//     return this;
// };
// SessionObj.prototype.addToBasket = function (basketGroup) {

//     this._basket = (this._basket === []) ? basketGroup : this._basket.concat(basketGroup);

//     const basketArray = basketGroup[0].orderGroup;
//     for (let basket of basketArray) {
//         this.addToBasketTotal(basket.total);
//         this.addToBasketTotalQuantity(basket.quantity);
//     }

//     localStorage.setItem('basket', this._basket); //JSON.stringify(this._basket));
//     localStorage.setItem('basketTotal', JSON.stringify(this._basketTotal));
//     localStorage.setItem('basketTotalQuantity', JSON.stringify(this._basketTotalQuantity));

//     return this;
// };

// SessionObj.prototype.getBasket = function () {
//     console.log(this._basket);
//     return this._basket;
// };

// SessionObj.prototype.addToBasketTotal = function (addend) {
//     this._basketTotal += Number(addend);
//     return this;
// };

// SessionObj.prototype.setBasketTotal = function (total) {
//     this._basketTotal = total;
//     return this;
// };

// SessionObj.prototype.getBasketTotal = function () {
//     return this._basketTotal;
// };

// SessionObj.prototype.getFormattedBasketTotal = function () {
//     return this.getFormattedTotal(this._basketTotal);
// };

// SessionObj.prototype.addToBasketTotalQuantity = function (addend) {
//     this._basketTotalQuantity += Number(addend);
//     return this;
// };

// SessionObj.prototype.setBasketTotalQuantity = function (total) {
//     this._basketTotalQuantity = total;
//     return this;
// };

// SessionObj.prototype.getBasketTotalQuantity = function () {
//     return this._basketTotalQuantity;
// };

// SessionObj.prototype.getFormattedBasketTotalQuantity = function () {
//     return this.getFormattedTotalQuantity(this._basketTotalQuantity);
// };

// SessionObj.prototype.setPreviousOrder = function (oldOrder) {
//     this._previousOrder = oldOrder;
//     return this;
// };

// SessionObj.prototype.getPreviousOrder = function () {
//     return this._previousOrder;
// };


// SessionObj.prototype.getFormattedTotal = function (total) {
//     return `Total: $${total}.00`;
// };


// SessionObj.prototype.getFormattedTotalQuantity = function (qty) {
//     return `${qty} items in basket.`;
// };

// Get the session token from localstorage and set it in the this object
SessionObj.prototype.initSessionFromLocalStorage = function () {

    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const phone = localStorage.getItem('phone');

    // only set the session if the localStorage values
    // have previously been set. Initially or on logout
    // token is set to false;
    if (typeof (token) == 'string') {
        try {
            this.setToken(JSON.parse(token))
                .setName(JSON.parse(name))
                .setPhone(JSON.parse(phone));

            return this.isTokenValid();
        } catch (e) {
            this.setToken(false)
                .setName(false)
                .setPhone(false);

            return false;
        }
    }
};

// Set the session token in the this object as well as localstorage
SessionObj.prototype.setSessionObj = function (token, name = '', phone = '') {

    console.log(`Session Token set to: ${JSON.stringify(token)}`);

    // save the session token here
    this.setToken(token)
        .setName(token === false ? false : name)
        .setPhone(token === false ? false : phone);

    // and in localStorage
    localStorage.setItem('token', JSON.stringify(this.getToken()));
    localStorage.setItem('name', JSON.stringify(this.getName()));
    localStorage.setItem('phone', JSON.stringify(this.getPhone()));

    // update the body (view)
    return this.isTokenValid();
};

// Renew the token
SessionObj.prototype.renewToken = async function () {

    if (this.isTokenValid()) {
        const reqObj = new RequestObj();
        reqObj.setPath('token/update')
            .setMethod('PUT')
            .addToPayload('id', this.getToken())
            .addToPayload('extend', true);

        // send the message to the server
        return await xhrRequest(reqObj)
            .then(
                (resObj) => { //fullfilled
                    console.log(`Renew Token: ${resObj.getResponsePayload().id}.`);
                    this.setSessionObj(
                        resObj.getResponsePayload().id,
                        resObj.getResponsePayload().firstName,
                        resObj.getResponsePayload().phone);

                    return this.isTokenValid();
                })
            .catch((error) => {
                console.log(`Token renewal error: ${error}`);
                return false;
            });
    }
};
