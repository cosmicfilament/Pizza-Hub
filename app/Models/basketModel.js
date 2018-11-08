'use strict';

/**
    * @file basket class module. A basket holds one customer's shopping cart and sums the total
    * @module Basket class and enumerations
    * @description encapsulates the functionality of a basket or cart
    * @exports Basket, BASKET_ENUMS
*/

const helpers = require('./../utils/helpers');
const { CUST_ENUMS } = require('./customerModel');
const { TOKEN_ENUMS } = require('./tokenModel');
const { MenuCollection } = require('./menuCollection');

/** @enum */
const BASKET_ENUMS = {
    TOKEN_STRING_LENGTH: 10,                                // unique id is pppppppppp_tttttttttt - p:phone# t:token
    KEY_LENGTH: CUST_ENUMS.PHONE_NUMBER_LENGTH + 1 + 10,    // length of above
    MAX_TIMESTAMP_LENGTH: 25                                // human readable timestamp
};

/**
     * @summary Basket class
     * @class
     * @classdesc Encapsulates a single cart or basket
   */
class Basket {
    constructor(id = '', phone = '', orderCollection = []) {
        this.init(id, phone, orderCollection);
    }
    /**
         * @summary init
         * @description Basket init method
   */
    init(id, phone, orderCollection) {
        this.id = id;
        this.phone = phone;
        this.orderCollection = orderCollection;
        this.timestamp = Basket.timeStamp();
    }

    /**
         * @summary getter total method
         * @description iterates thru the selection and choices summing up the total price
     */
    get total() {
        let total = 0.00;
        for (let menuItem of this.orderCollection) {
            total += menuItem.total();
        }
        return total;
    }

    /**
        * @static
        * @summary timeStamp
        * @description Basket timeStamp method
   */
    static timeStamp() {
        const dateNow = new Date(Date.now());
        return `${dateNow.getFullYear()}_${dateNow.getMonth() + 1}_${dateNow.getDate()}_${dateNow.toLocaleTimeString('en-US')}`;
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
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (prop === 'orderCollection') {
                    newBasket[prop] = new MenuCollection(obj[prop]);
                }
                else {
                    newBasket[prop] = obj[prop];
                }
            }
        }
        return newBasket;
    }

    deepCopyOrderCollection(ary) {
        this.orderCollection = new MenuCollection(ary);
    }

    /**
         * @summary createId method
         * @description creates a random string comprised of the customer phone number and a random 10 digit number
         * @returns new basket id
         * @throws nothing
     */
    createId() {

        // Define all the possible characters that could go into a string
        const possibleCharacters = TOKEN_ENUMS.CHARS;

        let token = '';
        for (let i = 1; i <= BASKET_ENUMS.TOKEN_STRING_LENGTH; i++) {
            // Get a random character from the possibleCharacters string
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the string
            token += randomCharacter;
        }

        this.id = `${this.phone}_${token}`;
        return this.id;
    }
    /**
        * @summary validateId method
        * @description Basket validateId method
    */
    validateId() {
        if (typeof (this.id) !== 'string' && this.id.length !== BASKET_ENUMS.KEY_LENGTH) {
            return 'Basket Id';
        }
        return true;
    }
    /**
        * @summary validatePhone method
        * @description Basket validatePhone method
    */
    validatePhone() {
        if (!helpers.validateString(this.phone, false, CUST_ENUMS.PHONE_NUMBER_LENGTH, '=')) {
            return 'phone';
        }
        return true;
    }

    /**
        * @summary validateOrderCollection method
        * @description just makes sure that the array is not empty
    */
    validateOrderCollection() {

        if (!helpers.validateArray(this.orderCollection)) {
            return 'orderCollection';
        }
        return true;
    }
    /**
        * @summary validateTimeStamp method
        * @description Basket validateTimeStamp method
    */
    validateTimeStamp() {
        if (!helpers.validateString(this.timestamp, false, BASKET_ENUMS.MAX_TIMESTAMP_LENGTH, '<=')) {
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
        }
        result = this.validateOrderCollection();
        if (result !== true) {
            return result;
        }

        return true;
    }
}

module.exports = {
    Basket,
    BASKET_ENUMS
};
