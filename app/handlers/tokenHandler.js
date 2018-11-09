'use strict';
/**
* @file tokenHandler crud functions. Tokens are session tokens
* @module tokenHandler.js
* @description  session token CRUD functions
* @exports create, read, update, menu
*/

const fDb = require('./../lib/fileDb');
const helpers = require('./../utils/helpers');

const { Customer } = require('./../Models/customerModel');
const { Token } = require('./../Models/tokenModel');
const { ResponseObj } = require('./../utils/handlerUtils');

module.exports = {
    /**
    * @async
    * @summary Token create function.
    * @description  Creates a new token based on data in the reqObj.payload.
    * @param reqObj - payload passes in customer password and phone number and expects a new token See tokenModel
    * @returns JSON string with newToken ojbect on success or promise error on failure
    * @throws promise error
    */
    create: async function (reqObj) {

        // phone and password are passed in the reqObj
        const custFromReqObj = Customer.clone(reqObj.payload);

        // validate the phone number which is the key on the customer
        let result = custFromReqObj.validatePhone();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on customer field: ${result}.`));
        }

        // validate the password
        result = custFromReqObj.validatePassword();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on customer field: ${result}.`));
        }
        // hash the pwd so we can compare it to db password
        const hashedPwdToValidate = Customer.createPasswordHash(custFromReqObj.password);
        if (!hashedPwdToValidate) {
            throw (helpers.promiseError(500, 'Error trying to validate the customer\'s password.'));
        }

        let custInDb = {};
        try {
            // get the saved customer associated with this token and validate against the hashed password
            custInDb = await fDb.read('customer', custFromReqObj.phone);
            if (!helpers.validateObject(custInDb)) {
                throw (helpers.promiseError(409, `Error retrieving the customer: ${custFromReqObj.phone}. Or the customer does not exist in our records.`));
            }
        }
        catch (error) {
            throw (helpers.promiseError(409, `Could not read customer record ${custFromReqObj.phone}. Reason: ${error.message} `));
        }

        if (hashedPwdToValidate !== custInDb.password) {
            throw (helpers.promiseError(400, 'Password did not match the customer\'s stored password.'));
        }
        // we made it this far so, let's create a token object
        const newToken = new Token(Token.createTokenString(), custInDb.phone, custInDb.firstName);
        //not sure how this could happen
        if (newToken.validateToken() !== true) {
            throw (helpers.promiseError(500, `Server error creating a session token for customer with phone number: ${custInDb.phone}.`));
        }
        // save it to the file
        try {
            await fDb.create('token', newToken.id, newToken);
        }
        catch (error) {
            throw (helpers.promiseError(409, `Could not create new session token for customer with phone number: ${custInDb.phone}. Reason: ${error.message}`));
        }
        return new ResponseObj(newToken.stringify(), 'token/create');
    },
    /**
    * @async
    * @summary Token read function.
    * @description  Reads an existing token based on the token id passed in the reqObj querystring
    * @param reqObj - reqObj passes in the token id in the querystring
    * @returns stringified token object on success or promise error on failure
    * @throws promise error
    */
    read: async function (reqObj) {

        const tkn = new Token(reqObj.queryStringObject.id);
        let result = tkn.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, 'Validation failed reading the session token.'));
        }

        try {
            // read the customer record
            result = await fDb.read('token', tkn.id);
            if (!helpers.validateObject(result)) {
                throw (helpers.promiseError(409, 'Error reading the file record for the session token. The token might not exist.'));
            }
        }
        catch (error) {
            throw (helpers.promiseError(409, `Could not read session token. Reason: ${error.message}`));
        }
        return new ResponseObj(JSON.stringify(result), 'token/read');
    },
    /**
    * @async
    * @summary Token update function.
    * @description  Extends the token validity for another 30 minutes
    * @param reqObj - payload passes in the token id and a new property called extends tells you to extend the time limit
    *
    * @returns JSON string with success msg or promise error on failure
    * @throws promise error
    */
    update: async function (reqObj) {

        // cloning the token will add a new property extend which signifies extend the time on the token
        const fieldsToUpdate = Token.clone(reqObj.payload);

        let result = fieldsToUpdate.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, 'Validation failed on session token.'));
        }
        result = helpers.validateBool(fieldsToUpdate.extend);
        if (result !== true) {
            throw (helpers.promiseError(400, 'Validation failed on session token.'));
        }
        let tknToUpdate = {};
        try {
            // read the existing token record and use it to build the update
            tknToUpdate = await fDb.read('token', fieldsToUpdate.id);
            if (!helpers.validateObject(tknToUpdate)) {
                throw (helpers.promiseError(409, 'Error reading the file record for the session token. Or that token does not exist.'));
            }
        }
        catch (error) {
            throw (helpers.promiseError(409, 'Error reading the file record for the session token. Or that token does not exist.'));
        }
        // if caller wants to extend the time on the token
        if (fieldsToUpdate.extend === true) {
            fieldsToUpdate.updateExpiry();
            tknToUpdate.expires = fieldsToUpdate.expires;
            try {
                result = await fDb.update('token', tknToUpdate.id, tknToUpdate);
                if (!result) {
                    throw (helpers.promiseError(500, 'Error updating the file record for the session token.'));
                }
                result = 'Successfully extended the token expiry on the session token.';
            }
            catch (error) {
                throw (helpers.promiseError(500, 'Error updating the record for the customer.'));
            }
        }
        return new ResponseObj(tknToUpdate.stringify(), 'token/update');
    },
    /**
    * @async
    * @summary Token delete function.
    * @description  Deletes a token with the token id passed in the querystring
    * @param reqObj - only the queryStringObject in the reqObj is used to retrieve the token id.
    * @returns JSON string with success msg or promise error on failure
    * @throws promise error
    */
    delete: async function (reqObj) {

        const tkn = new Token(reqObj.queryStringObject.id);
        let result = tkn.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on session token field: ${result}.`));
        }
        try {
            result = await fDb.delete('token', tkn.id);
            if (!result) {
                throw (helpers.promiseError(500, 'Could not delete the session token'));
            }
        }
        catch (error) {
            throw (helpers.promiseError(409, `Error deleting the file record for the session token. Reason: ${error.message}`));
        }
        const payload = JSON.stringify('Successfully deleted the session token:');
        return new ResponseObj(payload, 'token/delete');
    },
};
