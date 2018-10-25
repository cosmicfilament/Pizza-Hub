'use strict';

/*
*
*
*
*/

const helpers = require('../lib/helpers');

const CUST_ENUMS = {
    MAX_NAME_STRING: 20,
    PHONE_NUMBER_LENGTH: 10,
    MINIMUM_PASSWORD_LENGTH: 8,
    MAX_ADDRESS_LENGTH: 250,
    MAX_EMAIL_LENGTH: 60
};

class Customer {
    constructor(firstName = '', lastName = '', email = '', password = '', phone = '', address = '') {
        this.init(firstName, lastName, email, password, phone, address);
    }

    init(firstName, lastName, email, password, phone, address) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
    }

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

    validateFirstName() {
        if (!helpers.validateString(this.firstName, CUST_ENUMS.MAX_NAME_STRING, '<=')) {
            return 'firstName';
        }
        return true;
    }

    validateLastName() {
        if (!helpers.validateString(this.lastName, CUST_ENUMS.MAX_NAME_STRING, '<=')) {
            return 'lastName';
        }
        return true;
    }

    validateEmail() {
        if (!helpers.validateEmail(this.email, CUST_ENUMS.MAX_EMAIL_LENGTH)) {
            return 'email';
        }
        return true;
    }

    validatePhone() {
        if (!helpers.validateString(this.phone, CUST_ENUMS.PHONE_NUMBER_LENGTH, '=')) {
            return 'phone';
        }
        return true;
    }
    // works whether or not the password stored is hashed or not
    validatePassword() {
        if (!helpers.validatePassword(this.password, CUST_ENUMS.MINIMUM_PASSWORD_LENGTH)) {
            return 'password';
        }
        return true;
    }

    validateAddress() {
        if (!helpers.validateString(this.address, CUST_ENUMS.MAX_ADDRESS_LENGTH, '<=')) {
            return 'address';
        }
        return true;
    }

    validateCustomer() {

        let result = this.validateFirstName();
        if (result !== true)
            return result;

        result = this.validateLastName();
        if (result !== true)
            return result;

        result = this.validateEmail();
        if (result !== true)
            return result;

        result = this.validatePhone();
        if (result !== true)
            return result;

        result = this.validatePassword();
        if (result !== true)
            return result;

        result = this.validateAddress();
        if (result !== true)
            return result;

        return true;
    }

};

module.exports = {
    Customer,
    CUST_ENUMS
};
