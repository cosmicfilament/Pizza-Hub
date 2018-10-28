'use strict';

/**
    * @file helper functions for the handler modules
    * @module handlerUtils.js
    * @description functions shared across the handlers
*/

  const { Basket } = require('../Models/basketModel');
const { Token } = require('../models/tokenModel');
const fDb = require('../lib/fileDb');
const helpers = require('./helpers');

const utils = {};

// each crud function must use this function to ensure that the caller is not trying to spoof the real customer by ordering pizzas for him. As I am sure that never happens bwahahahahahahaha

  /**
    * @summary validateCustomerToken
    * @description validates the session token for each crud function
    * @param token id
    * @returns status or error message
    * @throws nothing
*/
  utils.validateCustomerToken = async function (token) {
  // get the token for this customer and see if it exists and is valid
    let tknObj = {};
  try {
    tknObj = await fDb.read('token', token);
    if (!helpers.validateObject(tknObj)) {
      return `Error when reading the customer session token. Either you are not logged in or the session has expired. Token: ${token}`;
    }
  }
  catch (error) {
    helpers.log(`Error when reading the customer session token. ${token}. ${error.message}`);
    return (`Error when reading the customer session token. ${token}. ${error.message}`);
  }
  // make a real Token object out of it.
    tknObj = Token.clone(tknObj);

  if (tknObj.validateTokenExpiration() === true) {
    return true;
  }

  return (`The session with the token ${token} has expired.`);
};

/**
    * @summary readBasket
    * @description validates the params and reads the contents of a basket
    * @param basket id
    * @returns basket or error
    * @throws error
*/
  utils.readBasket = async function (basketId) {

  const newBasket = new Basket();
  newBasket.id = basketId;

  let result = newBasket.validateId();
  if (result !== true) {
    throw (helpers.promiseError(400, `Validation failed on basket id field: ${basketId}.`));
  }

  try {
    // read the basket record
      result = await fDb.read('basket', newBasket.id);
    if (!helpers.validateObject(result)) {
      throw (helpers.promiseError(400, `Error reading the file record for the basket: ${newBasket.id}, or that basket does not exist.`));
    }
  }
  catch (error) {
    helpers.log(`Error thrown trying to read the basket ${newBasket.id}. ${error.message}`);
    throw (helpers.promiseError(400, `Could not read the basket record ${newBasket.id}. Reason: ${error.message}`));
  }
  return newBasket;
};

module.exports = utils;
