'use strict';

/*
*
* Order record data model
*
*/

const helpers = require('../lib/helpers');
const { CUST_ENUMS } = require('./customerModel');

const ORDER_ENUMS = {
    // id is pppppppppp_tttttttttt
    KEY_LENGTH: CUST_ENUMS.PHONE_NUMBER_LENGTH + 1 + helpers.TOKEN_STRING_LENGTH,
    MAX_TIMESTAMP_LENGTH: 30
};

class Order {
    constructor(id = '', phone = '', size = '', toppings = '') {
        this.init(id, phone, size, toppings);
    }

    init(id = '', phone, size, toppings) {
        this.id = id;
        this.phone = phone;
        this.size = size;
        this.toppings = toppings;
        this.timestamp = Order.timeStamp();
    };

    static timeStamp() {

        const dateNow = new Date(Date.now());
        return `${dateNow.getFullYear()}_${dateNow.getMonth() + 1}_${dateNow.getDate()}_${dateNow.toLocaleTimeString('en-US')}`;
    }

    static clone(obj) {

        if (obj === null || obj === 'undefined') {
            return obj;
        }

        const newOrder = new Order();
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                newOrder[prop] = obj[prop];
            }
        }
        return newOrder;
    }

    static get sizesArray() {
        return ['8', '12'];
    }

    static get sizesMap() {
        const sizes = new Map();
        sizes.set('8', 0);
        sizes.set('12', 1);
        return sizes;
    }

    static get toppingsArray() {
        return ['plain', 'pepperoni', 'sausage', 'chicken', 'pineapple', 'onions', 'peppers'];
    }

    static get toppingsMap() {
        const toppings = new Map();
        toppings.set('plain', 0);
        toppings.set('pepperoni', 1);
        toppings.set('sausage', 2);
        toppings.set('chicken', 3);
        toppings.set('pineapple', 4);
        toppings.set('onions', 5);
        toppings.set('peppers', 6);
        return toppings;
    }
    createId(token = '') {
        this.id = `${this.phone}_${token}`;
        return this.id;
    }

    // id is the file name === phone + _ + token
    validateId() {
        if (typeof (this.id) != 'string' && this.id.length != ORDER_ENUMS.KEY_LENGTH) {
            return 'Order Id';
        }
        return true;
    }

    validatePhone() {
        if (!helpers.validateString(this.phone, CUST_ENUMS.PHONE_NUMBER_LENGTH, '=')) {
            return 'phone';
        }
        return true;
    }

    validatePizzaSize() {
        if (!helpers.validateStringArray(this.size, Order.sizesArray)) {
            return false;
        }
        return true;
    }

    validateToppings() {

        const toppingsAvailable = Order.toppingsMap;
        let selection = true;

        for (let topping of this.toppings) {
            if (!toppingsAvailable.has(topping)) {
                selection = topping;
                break;
            }
        }
        return selection;
    }

    validateTimeStamp() {
        if (!helpers.validateString(this.timestamp, ORDER_ENUMS.MAX_TIMESTAMP_LENGTH, '<=')) {
            return false;
        }
        return true;
    }

    validateOrder(skipKey = false) {

        let result = this.validatePhone();
        if (result !== true)
            return result;

        if (!skipKey) {
            result = this.validateId();
            if (result !== true)
                return result;
        }

        result = this.validatePizzaSize();
        if (result !== true)
            return result;

        result = this.validateToppings();
        if (result !== true)
            return result;

        result = this.validateTimeStamp();
        if (result !== true)
            return result;

        return true;
    }
}

module.exports = {
    Order,
    ORDER_ENUMS
};
