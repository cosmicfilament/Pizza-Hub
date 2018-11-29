'use strict';
/*eslint quotes: ["off", "double"]*/

/**
 * @file basket class module. A basket holds one customer's shopping cart and sums the total
 * @module Basket class and enumerations
 * @description encapsulates the functionality of a basket or cart
 * @exports Basket, BASKET_ENUMS
 */

const helpers = require('./../public/js/common/helpers');
const enums = require('./../public/js/common/enumerations');
const { smartMap } = require('../public/js/common/smartCollection')._mc;
const logs = require('./../utils/logs');

/**
 * @summary Basket class
 * @class
 * @classdesc Encapsulates a single cart or basket
 */
class Basket {
    // bare constructor does nothing. use clone to create a concrete object
    constructor(id = '', phone = '', expires = Date.now(), timestamp = Date.now(),
        totalQuantity = 0, totalPrice = 0, orderCollection = null) {

        this._id = id;
        this._phone = phone;
        this._expires = expires;
        this._timestamp = timestamp;
        this._totalQuantity = totalQuantity;
        this._totalPrice = totalPrice;
        this._orderCollection = orderCollection;
    }


    stringify() {
        return ({ "collection": this._orderCollection.stringify() });
    }

    /**
    * @static
    * @summary Basket clone method
    * @description Creates a new basket based on the properties passed into it.
    * @param any object that can be coerced into  basket
    * @returns a new basket object
    * @throws nothing
    */
    static clone(obj) {

        if (obj === null || obj === 'undefined') {
            return obj;
        }
        const newBasket = new Basket();
        if (obj instanceof Map) {

            newBasket.orderCollection = obj;
            newBasket.id = helpers.validateString(obj.id);
            newBasket.phone = helpers.validateString(obj.phone);
            newBasket.expires = helpers.validateString(obj.expires) ? obj.expires : Basket.createBasketExpiry();
            newBasket.timestamp = helpers.validateString(obj.timestamp) ? obj.timestamp : Basket.createTimestamp();
            newBasket.totalPrice = helpers.validateString(obj.totalPrice);
            newBasket.totalQuantity = helpers.validateString(obj.totalQuantity);
        }
        else {

            let array = obj.collection.basket.orderItems;
            let header = obj.collection.header.metaData;
            let items = [];

            if (helpers.validateArray(array)) {
                for (let index = 0; index < array.length; index++) {
                    let item = array[index];
                    items.push(item);
                }
            }
            // all these are initialized before the orderCollection so that the setters
            // will initialize their properties only.
            newBasket.id = helpers.validateString(header.id);
            newBasket.phone = helpers.validateString(header.phone);
            // should be empty if created by the client from the
            // browser otherwise should hold valid times
            newBasket.expires = helpers.validateString(header.expires) ? header.expires : Basket.createBasketExpiry();
            newBasket.timestamp = helpers.validateString(header.timestamp) ? header.timestamp : Basket.createTimestamp();
            newBasket.totalPrice = helpers.validateString(header.totalPrice);
            newBasket.totalQuantity = helpers.validateString(header.totalQuantity);

            newBasket.orderCollection = new smartMap(items, newBasket.id, newBasket.phone,
                newBasket.totalQuantity, newBasket.totalPrice, newBasket.expires, newBasket.timestamp);
        }

        return newBasket;
    }

    static createBasketExpiry() {
        return (Date.now() + enums.BASKET_EXPIRY);
    }

    /**
    * @static
    * @summary timeStamp
    * @description Basket timeStamp method
    */
    static createTimestamp() {
        const dateNow = new Date(Date.now());
        return `${dateNow.getFullYear()}_${dateNow.getMonth() + 1}_${dateNow.getDate()}_${dateNow.toLocaleTimeString('en-US')}`;
    }

    shallowCopy(basket) {
        if (helpers.validateObject(basket)) {
            this._id = basket.id;
            this._phone = basket.phone;
            this._expires = Basket.createBasketExpiry();
            this._timestamp = Basket.createTimestamp();

        }
        else {
            logs.log('error in updating the basket. Could not copy from the old basket.', 'b', 'red');
            return false;
        }
        return true;
    }

    get id() {
        return this._id;
    }
    set id(val) {
        this._id = val;
        if (this._orderCollection) {
            this._orderCollection.id = val;
        }
        return this;
    }

    get phone() {
        return this._phone;
    }

    set phone(val) {
        this._phone = val;
        if (this._orderCollection) {
            this._orderCollection.phone = val;
        }
        return this;
    }

    get totalQuantity() {
        return this._totalQuantity;
    }

    set totalQuantity(val) {
        this._totalQuantity = val;
        if (this._orderCollection) {
            this._orderCollection.totalQuantity = val;
        }
    }

    get totalPrice() {
        return this._totalPrice;
    }

    set totalPrice(val) {
        this._totalPrice = val;
        if (this._orderCollection) {
            this._orderCollection.totalPrice = val;
        }
        return this;
    }

    get expires() {
        return this._expires;
    }

    set expires(val) {
        this._expires = val;
        if (this._orderCollection) {
            this._orderCollection.expires = val;
        }
        return this;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(val) {
        this._timestamp = val;
        if (this._orderCollection) {
            this._orderCollection.timestamp = val;
        }
        return this;
    }

    get orderCollection() {
        return this._orderCollection;
    }

    set orderCollection(val) {
        this._orderCollection = val;
    }

    validateBasketExpiry() {
        // sanity check for a bs number
        if (!helpers.validateIntegerRange(this._expires, enums.DATE_START, Date.now() + enums.BASKET_EXPIRY)) {
            return 'expiration';
        }
        if (this._expires <= Date.now()) {
            return false;
        }
        return true;
    }
    /**
    * @summary validateId method
    * @description Basket validateId method
    */
    validateId() {
        if (helpers.TYPEOF(this._id) !== 'string' && this._id !== enums.BASKETID_LENGTH) {
            return 'Basket Id';
        }
        return true;
    }
    /**
    * @summary validatePhone method
    * @description Basket validatePhone method
    */
    validatePhone() {

        if (!helpers.validateString(this._phone, false, enums.PHONE_NUMBER_LENGTH, '=')) {
            return 'phone';
        }
        return true;
    }

    /**
    * @summary validateOrderCollection method
    * @description just makes sure that the array is not empty
    */
    validateOrderCollection() {

        if (!this._orderCollection || helpers.TYPEOF(this._orderCollection) !== 'map') {
            return 'orderCollection';
        }
        return true;
    }
    /**
    * @summary validateTimeStamp method
    * @description Basket validateTimeStamp method
    */
    validateTimeStamp() {
        if (!helpers.validateString(this._timestamp, false, enums.MAX_TIMESTAMP_LENGTH, '<=')) {
            return false;
        }
        return true;
    }
    /**
    * @summary validateBasket method
    * @description validates the basket object properties optionally skipping the id property, when not created yet.
    * @param skipId - boolean that if true skips the id property
    * @returns true if successfull or the name of the first property to fail on error
    * @throws nothing
    */
    validateBasket(skipId = false) {

        let result = this.validatePhone();
        if (result !== true) {
            return result;
        }
        if (!skipId) {

            result = this.validateId();
            if (result !== true) {
                return result;
            }

            result = this.validateBasketExpiry();
            if (result !== true) {
                return result;
            }
        }

        result = this.validateOrderCollection();
        if (result !== true) {
            return result;
        }

        return true;
    }
}

module.exports = Basket;
