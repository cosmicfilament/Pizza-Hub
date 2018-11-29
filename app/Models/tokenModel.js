'use strict';

/**
 * @file Token class module which generates a session token
 * @module Token class and enumerations
 * @exports Token
 */

const helpers = require('./../public/js/common/helpers');
const enums = require('./../public/js/common/enumerations');

/**
 * @summary Token class
 * @class
 * @classdesc Encapsulates what it is to be a validation Token
 * @exports Token
 */
class Token {
    constructor(id = '', phone = '', firstName = '') {
        // allow creation of an incomplete token, but set expiry to now
        if (id === '' || phone === '') {
            this.id = id;
            this.phone = phone;
            this.firstName = firstName;
            this.expires = Date.now();
        } else {
            this.init(id, phone, firstName);
        }
    }
    /**
     * @summary Token init method
     * @description initializes the Token object properties
     */
    init(id, phone, firstName) {
        this.id = id;
        this.phone = phone;
        this.firstName = firstName;
        this.expires = Date.now() + enums.TOKEN_EXPIRY;
    }
    /**
     * @static
     * @summary Token clone method
     * @description Creates a new Token based on the properties passed into it. Can end up with less or more properties than the canonical Token.
     * @param an object that can be coerced into a Token
     * @returns a new token object
     * @throws nothing
     */
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
            this.expires = Date.now() + enums.TOKEN_EXPIRY;
        } else {
            this.expires = Date.now();
        }
        return this.expires;
    }

    stringify() {
        return JSON.stringify({
            'id': this.id,
            'phone': this.phone,
            'firstName': this.firstName,
            'expires': this.expires
        });
    }
    /**
     * @summary validateId
     * @description token validateId method
     */
    validateId() {
        if (!helpers.validateString(this.id, false, enums.TOKENID_LENGTH, '=')) {
            return 'token id';
        }
        return true;
    }
    /**
     * @summary validatePhone
     * @description token validatePhone method
     */

    validatePhone() {
        if (!helpers.validateString(this.phone, false, enums.PHONE_NUMBER_LENGTH, '=')) {
            return 'customer phone';
        }
        return true;
    }

    /**
     * @summary validateTokenExpiration
     * @description token validateExpiration method
     */

    validateTokenExpiration() {
        if (!helpers.validateIntegerRange(this.expires, enums.DATE_START, Date.now() + enums.TOKEN_EXPIRY)) {
            return 'expiration';
        }
        if (this.expires <= Date.now()) {
            return 'expiration token has expired';
        }
        return true;
    }
    /**
     * @summary validateToken
     * @description validates the complete token object
     * @returns true on success or the string name of the failed property on failure
     * @throws nothing
     */
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

module.exports = Token;
