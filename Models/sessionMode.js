'use strict';
/**
    * @module Token class and enumerations
    * @exports Token, TOKEN_ENUMS
*/

const fDb = require('./../lib/fileDb');
const helpers = require('./../lib/helpers');

const { Customer, CUST_ENUMS } = require('./../Models/customerModel');
const { Token, TOKEN_ENUMS } = require('./../Models/tokenModel');
const { Order, ORDER_ENUMS } = require('./../Models/orderModel');

/**
   * @summary Session class
   * @desc Encapsulates the session object that is called everytime a new person logs into the site
*/
class Session {
    /**
        * @static
        * @summary Session constructor
        * @desc Creates a new session which is used to navigate the site
     */
    constructor() {
        this.token = {};
        this.customer = {};
        this.order = {};
        this.menu = {};
    }

    login(phone = '', password = '') {
        this.customer
    }

    logout() {

    }

    placeOrderAndPay() {

    }

    notifyCustomerByEmail() {

    }

    newCustomer() {

    }
}

module.exports = {
    Session,
    SESSION_ENUMS
};
