'use strict';

/**
    * @file Token class module which generates a session token
    * @module Token class and enumerations
    * @exports Token, TOKEN_ENUMS
*/

  const helpers = require('./../utils/helpers');
const { CUST_ENUMS } = require('./customerModel');

const TOKEN_ENUMS = {
  CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  TOKEN_STRING_LENGTH: 20,
  // expires in 30 minutes
    TOKEN_EXPIRY: 1000 * 60 * 30,
  // for validating the date object
    MAX_INT: Number.MAX_SAFE_INTEGER
  };

/**
   * @summary Token class
   * @class
   * @classdesc Encapsulates what it is to be a validation Token
   * @exports Token
*/
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
  /**
        * @summary Token init method
        * @description initializes the Token object properties
    */
    init(id, phone) {
    this.id = id;
    this.phone = phone;
    this.expires = Date.now() + TOKEN_ENUMS.TOKEN_EXPIRY;
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
  /**
        * @static
        * @summary Token CreateTokenString method
        * @description Creates a new token id
        * @returns a new token object
        * @throws nothing
    */
    static createTokenString() {

    // Define all the possible characters that could go into a string
      const possibleCharacters = TOKEN_ENUMS.CHARS;

    let token = '';
    for (let i = 1; i <= TOKEN_ENUMS.TOKEN_STRING_LENGTH; i++) {
      // Get a random character from the possibleCharacters string
        let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the string
        token += randomCharacter;
    }
    // Return the final string
      return token;
  }
  /**
        * @summary Token updateExpiry method
        * @description Either updates the expiration by 30 minutes or immediately revokes the token
        * @param extend - boolean that if true extends the token and if false revokes the token
        * @returns a new Date object
        * @throws nothing
    */
    updateExpiry(extend = true) {
    if (extend) {
      return Date.now() + TOKEN_ENUMS.TOKEN_EXPIRY;
    }
    return Date.now();
  }
  /**
        * @summary validateId
        * @description token validateId method
   */
    validateId() {
    if (!helpers.validateString(this.id, TOKEN_ENUMS.TOKEN_STRING_LENGTH, '=')) {
      return 'token id';
    }
    return true;
  }
  /**
        * @summary validatePhone
        * @description token validatePhone method
   */

    validatePhone() {
    if (!helpers.validateString(this.phone, CUST_ENUMS.PHONE_NUMBER_LENGTH, '=')) {
      return 'customer phone';
    }
    return true;
  }
  /**
        * @summary validateTokenExpiration
        * @description token validateExpiration method
   */

    validateTokenExpiration() {
    if (!helpers.validateIntegerRange(this.expires, 1, TOKEN_ENUMS.MAX_INT)) {
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

module.exports = {
  Token,
  TOKEN_ENUMS
  };
