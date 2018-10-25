'use strict';

/*
*
*
*
*/

const helpers = require('../lib/helpers');
const { CUST_ENUMS } = require('./customerModel');

const TOKEN_ENUMS = {
    TOKEN_STRING_LENGTH: helpers.TOKEN_STRING_LENGTH,
    // expires in 30 minutes
    TOKEN_EXPIRY: 1000 * 60 * 30,
    // for validating the date object
    MAX_INT: Number.MAX_SAFE_INTEGER
};

class Token {
    constructor(id = '', phone = '') {
        // allow creation of an incomplete token, but set expiry to now
        if (id === '' || phone === '') {
            this.id = id;
            this.phone = phone;
            this.expires = Date.now();
        }
        else {
            this.init(id, phone);
        }
    }

    init(id, phone) {
        this.id = id;
        this.phone = phone;
        this.expires = Date.now() + TOKEN_ENUMS.TOKEN_EXPIRY;
    }

    static clone(obj) {

        if (null === obj || obj === 'undefined') {
            return obj;
        }
        // sets expiry to now, which will be overriddent during the clone if obj has that property
        const newToken = new Token();
        // deep copy of token, but leave out the customer password if somehow it is included
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== 'password') {
                newToken[prop] = obj[prop];
            }
        }
        return newToken;
    }

    updateExpiry(extend = true) {
        if (extend) {
            return Date.now() + TOKEN_ENUMS.TOKEN_EXPIRY;
        }
        return Date.now();
    }

    validateId() {
        if (!helpers.validateString(this.id, TOKEN_ENUMS.TOKEN_STRING_LENGTH, '=')) {
            return 'invalid token Id';
        }
        return true;
    }

    validatePhone() {
        if (!helpers.validateString(this.phone, CUST_ENUMS.PHONE_NUMBER_LENGTH, '=')) {
            return 'invalid customer Id';
        }
        return true;
    }

    validateTokenExpiration() {
        if (!helpers.validateIntegerRange(this.expires, 1, TOKEN_ENUMS.MAX_INT)) {
            return 'invalid expiration token';
        }
        if (this.expires <= Date.now()) {
            return 'expiration token has expired';
        }
        return true;
    }

    validateToken() {
        let result = this.validateId();
        if (result !== true) {
            return result;
        }

        result = this.validatePhone();
        if (result !== true) {
            return result;
        }

        result = this.validateTokenExpiration();
        if (result !== true) {
            return result;
        }
        return true;
    }
}

module.exports = {
    Token,
    TOKEN_ENUMS
};
