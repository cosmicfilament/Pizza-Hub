import {
    RequestObj,
    xhrRequest
} from './app/public/js/ajax.js';

// MenuCollection is defined as a script entry in main.html.

// CartObj is somewhat a combination of the node js module Basket.js
// and the client script session.js
export function CartObj(id = '', phone = '', timestamp = '', orders = []) {
    this._id = id;
    this._phone = phone;
    this.timestamp = timestamp;
    this._orderCollection = orders;
}

CartObj.prototype.cloneFromLocalStorage = function () {

    const cartId = helpers.parseJsonToObject(localStorage.getItem('cartId'));
    const phone = helpers.parseJsonToObject(localStorage.getItem('phone'));
    const timestamp = helpers.parseJsonToObject(localStorage.getItem('timestamp'));
    let orderCollection = helpers.parseJsonToObject(localStorage.getItem('orderCollection'));
    orderCollection = new MenuCollection(orderCollection);

    if (helpers.validateString(cartId) && helpers.validateArray(orderCollection)) {
        const cart = new CartObj(cartId, phone, timestamp, orderCollection);
        if (helpers.validateObject(cart)) {
            return cart;
        }
    }
    return null;
};

CartObj.prototype.setId = function (id) {
    this._id = id;
    localStorage.setItem('cartId', JSON.stringify(id));
    return this;
};

CartObj.prototype.getId = function () {
    return this._id;
};

CartObj.prototype.getPhone = function () {
    return this._phone;
};

CartObj.prototype.createTimeStamp = function () {
    const dateNow = new Date(Date.now());
    return `${dateNow.getFullYear()}_${dateNow.getMonth() + 1}_${dateNow.getDate()}_${dateNow.toLocaleTimeString('en-US')}`;
};

CartObj.prototype.updateTimeStamp = function () {
    this._timestamp = this.createTimeStamp();
    localStorage.setItem('timestamp', JSON.stringify(this._timestamp));
    return this;
};

CartObj.prototype.getTimeStamp = function () {
    return this._timestamp;
};

CartObj.prototype.setOrderCollection = function (orders) {
    this._orderCollection = orders;
    localStorage.setItem('orderCollection', JSON.stringify(orders));
    return this;
};

CartObj.prototype.getOrderCollection = function () {
    return this._orderCollection;
};

CartObj.prototype.addToCart = function (ary) {

};

CartObj.prototype.removeFromCart = function (ary) {

};
