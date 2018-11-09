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

utils.ResponseObj = function (payload = {}, sender = '', content_type = 'application/json', statusCode = '200') {
    this._content_type = content_type;
    this._statusCode = statusCode;
    this._payload = payload;
    this._sender = sender;
};
utils.ResponseObj.prototype.getContentType = function () { return this._content_type; };
utils.ResponseObj.prototype.setContentType = function (str) {
    this._content_type = str;
    return this;
};
utils.ResponseObj.prototype.getStatusCode = function () { return this._statusCode; };
utils.ResponseObj.prototype.setStatusCode = function (str) {
    this._statusCode = str;
    return this;
};
utils.ResponseObj.prototype.getPayload = function () { return this._payload; };
utils.ResponseObj.prototype.setPayload = function (str) {
    this._payload = str;
    return this;
};
utils.ResponseObj.prototype.getSender = function () { return this._sender; };
utils.ResponseObj.prototype.setSender = function (str) {
    this._sender = str;
    return this;
};

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
    let tknObj = await fDb.read('token', token).catch((error) => {
        return (`Error when reading the customer session token. ${error.message}`);
    });

    if (!helpers.validateObject(tknObj)) {
        return 'Error when reading the customer session token. Either you are not logged in or the session has expired.';
    }

    // make a real Token object out of it.
    tknObj = Token.clone(tknObj);

    if (tknObj.validateTokenExpiration() === true) {
        return true;
    }
    return ('The session token has expired.');
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

    // read the basket record
    result = await fDb.read('basket', newBasket.id).catch((error) => {
        throw (helpers.promiseError(400, `Could not read the basket record ${newBasket.id}. Reason: ${error.message}`));
    });

    if (!helpers.validateObject(result)) {
        throw (helpers.promiseError(400, `Error reading the file record for the basket: ${newBasket.id}, or that basket does not exist.`));
    }
    return newBasket;
};

module.exports = utils;
