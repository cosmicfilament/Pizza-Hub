'use strict';
/*eslint no-useless-escape: "off"*/

/**
* @file customer class module basic user or customer object
* @module Customer class and enumerations
* @description encapsulates customer functionality
* @exports Customer, CUST_ENUMS
*/

const helpers = require('./../utils/helpers');
const { envCfg } = require('./../lib/config');
const crypto = require('crypto');

const CUST_ENUMS = {
    MAX_NAME_STRING: 20,        //max length of first or last name
    PHONE_NUMBER_LENGTH: 10,
    MINIMUM_PASSWORD_LENGTH: 8,
    MAX_ADDRESS_LENGTH: 250,    //if address is longer than this move
    MAX_EMAIL_LENGTH: 254       //not sure of the validity of this cribbed from same source as email validation code
};

/**
     * @summary Customer class
     * @class
     * @classdesc Encapsulates what it is to be a customer
 */
class Customer {
    constructor(firstName = '', lastName = '', email = '', password = '', phone = '', address = '') {
        this.init(firstName, lastName, email, password, phone, address);
    }

    /**
        * @summary Customer init method
        * @description init method
     */
    init(firstName, lastName, email, password, phone, address) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
    }
    /**
         * @static
         * @summary clone
         * @description clones a Customer from customer a customer like object
         * @param clones a customer from anything with a customer property
         * @returns a new customer object
         * @throws nothing
     */
    static clone(obj) {

        if (null === obj || obj === 'undefined') {
            return obj;
        }
        const newCust = new Customer();
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                newCust[prop] = obj[prop];
            }
        }
        return newCust;
    }
    /**
         * @static
         * @summary createPasswordHash
         * @description Customer createPasswordHash method that creates a hash on the value passed in
         * @param clear text password
     */
    static createPasswordHash(pwd) {
        return crypto.createHmac('sha256', envCfg.hashingSecret).update(pwd).digest('hex');
    }
    /**
        * @summary validateFirstName
        * @description Customer validateFirstName method
     */
    validateFirstName() {
        if (!helpers.validateString(this.firstName, CUST_ENUMS.MAX_NAME_STRING, '<=')) {
            return 'firstName';
        }
        return true;
    }
    /**
        * @summary validateLastName
        * @description Customer validateLastName method
     */
    validateLastName() {
        if (!helpers.validateString(this.lastName, CUST_ENUMS.MAX_NAME_STRING, '<=')) {
            return 'lastName';
        }
        return true;
    }
    /**
         * @summary validateEmail
         * @description method to validate the email address passed in
         * @returns true on success or an error string if failed.
         * @throws nothing
     */
    validateEmail() {

        const err = 'email validation failed';

        if (!helpers.validateString(this.email, CUST_ENUMS.MAX_EMAIL_LENGTH, '<=')) {
            return err;
        }

        // Thanks to:
        // https://github.com/manishsaraan
        // http://fightingforalostcause.net/misc/2006/compare-email-regex.php
        // http://thedailywtf.com/Articles/Validating_Email_Addresses.aspx
        // http://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses/201378#201378
        const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

        const valid = tester.test(this.email);
        if (!valid) {
            return err;
        }
        // Further checking of some things regex can't handle
        const parts = this.email.split('@');
        if (parts[0].length > 64) {
            return err;
        }
        const domainParts = parts[1].split('.');
        const yuSoLong = domainParts.some((part) => { return part.length > 63; });
        if (yuSoLong) {
            return err;
        }
        return true;
    }
    /**
            * @summary validatePhone
            * @description Customer validatePhone method
         */
    validatePhone() {
        if (!helpers.validateString(this.phone, CUST_ENUMS.PHONE_NUMBER_LENGTH, '=')) {
            return 'phone';
        }
        return true;
    }
    /**
             * @summary validatePassword
             * @description validates the password min length only. works on the hashed or clear text password
             * @todo rewrite this so that if the pwd i clear text we can do better validation
         */
    validatePassword() {
        if (!helpers.validateString(this.password, CUST_ENUMS.MINIMUM_PASSWORD_LENGTH, '>=')) {
            return 'password';
        }
        return true;
    }
    /**
            * @summary validateAddress method
            * @description Customer validateAddress method
         */
    validateAddress() {
        if (!helpers.validateString(this.address, CUST_ENUMS.MAX_ADDRESS_LENGTH, '<=')) {
            return 'address';
        }
        return true;
    }
    /**
             * @summary validateCustomer
             * @description method to validate the complete customer object using the above helper methods
             * @returns true if successfull or the name of the first property to fail on error
             * @throws nothing
         */
    validateCustomer() {

        let result = this.validateFirstName();
        if (result !== true) {
            return result;
        }
        result = this.validateLastName();
        if (result !== true) {
            return result;
        }
        result = this.validateEmail();
        if (result !== true) {
            return result;
        }
        result = this.validatePhone();
        if (result !== true) {
            return result;
        }
        result = this.validatePassword();
        if (result !== true) {
            return result;
        }
        result = this.validateAddress();
        if (result !== true) {
            return result;
        }
        return true;
    }

}

module.exports = {
    Customer,
    CUST_ENUMS
};
