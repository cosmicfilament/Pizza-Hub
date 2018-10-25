'use strict';

/*
*
 * Helpers functions for the handler modules
 *
 */

// Dependencies
const config = require('./config');
const crypto = require('crypto');

// Container for all the helpers
const helpers = {};

helpers.TOKEN_STRING_LENGTH = 10;

// constants used in this module and the handler modules

Number.prototype.between = function (a, b, inclusive = true) { // boolean
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return inclusive ? this >= min && this <= max : this > min && this < max;
};

helpers.promiseError = (statusCode, message) => {
  return {
    'statusCode': statusCode,
    'message': message
  };
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str = '') => { // string or false
  // gets rid of nuisance error output when there is no JSON data
  if (!str) return false;

  try {
    return JSON.parse(str);
  } catch (err) {
    return {};
  }
};

// Create a SHA256 hash for password creation
helpers.hash = (str = '', len) => { // string or false
  if (typeof (str) == 'string' && str.length >= len) {
    return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
  } else {
    return false;
  }
};

// validate boolean request inputs
// value: boolean
// returns result or false if value != boolean
helpers.validateBool = (value = false) => { //boolean
  return typeof (value) === 'boolean' ? !!value : false;
};

// validate string input
// str: string
// len: length. minimum length of the string if equ is false or exact length if equ is true
// equ: boolean if true len = str.len else str greater than or equal to len
// returns false if validation fails
helpers.validateString = (str = '', len = 20, comparator = '<=') => {

  // if it isn't a string why waste time
  if (typeof (str) !== 'string' || str.length === 0) {
    return false;
  }
  const _str = str.trim();

  switch (comparator) {
    case '<':
      return _str.length < len ? _str : false;
    case '<=':
      return _str.length <= len ? _str : false;
    case '=':
      return _str.length === len ? _str : false;
    case '>':
      return _str.length > len ? _str : false;
    case '>=':
      return _str.length >= len ? _str : false;
    default:
      return false;
  }
};

// validate password input
// password must be greater than or equal to 8 characters long
// need to add more criteria to this function
helpers.validatePassword = function (str = '', minLen = 8) { // string or false
  return this.validateString(str, minLen, '>=');
};

// Create a string of random alphanumeric characters, of a given length
// In our case we are setting string length to 20
helpers.createRandomString = (strLength = helpers.TOKEN_STRING_LENGTH) => { // string or false
  strLength = typeof (strLength) == 'number' && strLength >= helpers.TOKEN_STRING_LENGTH ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (let i = 1; i <= strLength; i++) {
      // Get a random charactert from the possibleCharacters string
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

helpers.validateStringArray = (str = '', arr = []) => { // string or false
  if (typeof (str) === 'string' && arr.indexOf(str.trim()) > -1) {
    return str.trim();
  }
  return false; 8
};

helpers.validateArray = (obj = '') => { // array object or false
  if (typeof (obj) === 'object' && obj instanceof Array && obj.length > 0) {
    return obj;
  }
  return false;
};
// check if object is in fact an  object and that it is not empty
helpers.validateObject = (obj = '') => { //object or false
  if (typeof (obj) === 'object' && obj !== null && Object.keys(obj).length > 0) {
    return obj;
  }
  return false;
};

helpers.validateIntegerRange = (num = 0, start=0, len = 0) => { // number or false
  if (typeof (num) === 'number' && num % 1 === 0 && num.between(start, len)) {
    return num;
  }
  return false;
};

helpers.validateEmail = (str = '', len) => {
  return helpers.validateString(str, len, '<=');
};

helpers.log = (color, msg) => {
  if (config.envName === 'staging') {

    switch (color) {
      case 'red':
        color = '\x1b[31m%s';
        break;
      case 'green':
        color = '\x1b[32m%s';
        break;
      case 'blue':
        color = '\x1b[34m%s';
        break;
      case 'yellow':
        color = '\x1b[33m%s';
        break;
      case 'black':
        color = '\x1b[30m%s';
        break;
      case 'white':
        color = '\x1b[37m%s';
        break;
      case 'cyan':
        color = '\x1b[36m%s';
        break;
      case 'magenta':
        color = '\x1b[35m%s';
        break;
    };
    return console.log(color, msg);
  }
};

// Export the module
module.exports = helpers;
