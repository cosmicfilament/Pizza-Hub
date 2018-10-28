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
      throw (helpers.promiseError(400, `Validation failed creating a token on customer field: ${result}.`));
    }
    // validate the password
      result = custFromReqObj.validatePassword();
    if (result !== true) {
      throw (helpers.promiseError(400, `Validation failed creating a token on customer field: ${result}.`));
    }
    // hash the pwd so we can compare it to db password
      const hashedPwdToValidate = Customer.createPasswordHash(custFromReqObj.password);
    if (!hashedPwdToValidate) {
      throw (helpers.promiseError(500, 'Could not hash the customer\'s password.  Cannot create a token.'));
    }

    let custInDb = {};
    try {
      // get the saved customer associated with this token and validate against the hashed password
        custInDb = await fDb.read('customer', custFromReqObj.phone);
      if (!helpers.validateObject(custInDb)) {
        throw (helpers.promiseError(409, `Error reading the file record for the customer: ${custFromReqObj.phone}. Or that customer does not exist. Cannot create a token.`));
      }
    }
    catch (error) {
      helpers.log(`Error thrown trying to read the customer ${custFromReqObj.phone}. ${error.message}`);
      throw (helpers.promiseError(409, `Could not read customer record ${custFromReqObj.phone}. Cannot create a token. Reason: ${error.message} `));
    }

    if (hashedPwdToValidate !== custInDb.password) {
      throw (helpers.promiseError(400, 'Password did not match the customer\'s stored password.  Cannot create a token.'));
    }
    // we made it this far so, let's create a token object
      const newToken = new Token(Token.createTokenString(), custInDb.phone);
    //not sure how this could happen
      if (newToken.validateToken() !== true) {
      helpers.log(`Error thrown trying to create new token ${newToken.id} for customer ${custInDb.phone}.`);
      throw (helpers.promiseError(500, `Server error creating a token for customer with phone number: ${custInDb.phone}.`));
    }
    // save it to the file
      try {
      await fDb.create('token', newToken.id, newToken);
    }
    catch (error) {
      helpers.log(`Error thrown trying to create new token ${newToken.id} for customer ${custInDb.phone}. ${error.message}`);
      throw (helpers.promiseError(409, `Could not create new token record for customer with phone number: ${custInDb.phone}. Reason: ${error.message}`));
    }

    return {
      'content_type': 'application/json',
      'statusCode': '200',
      'payload': JSON.stringify(newToken)
      };
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
      throw (helpers.promiseError(400, `Validation failed on token field: ${result}.`));
    }

    try {
      // read the customer record
        result = await fDb.read('token', tkn.id);
      if (!helpers.validateObject(result)) {
        throw (helpers.promiseError(409, `Error reading the file record for the token: ${tkn.id}. The token might not exist.`));
      }
    }
    catch (error) {
      helpers.log(`Error thrown trying to read the token ${tkn.id}. ${error.message}`);
      throw (helpers.promiseError(409, `Could not read token record ${tkn.id}. Reason: ${error.message}`));
    }

    return {
      'content_type': 'application/json',
      'statusCode': '200',
      'payload': JSON.stringify(result)
      };
  },
  /**
         * @async
         * @summary Token update function.
         * @description  Extends the token validity for another 30 minutes or conversely immediately invalidates the token
         * @param reqObj - payload passes in the token id and a new property called extends which signifies whether to extend or revoke the token.
         * @returns JSON string with success msg or promise error on failure
         * @throws promise error
    */
    update: async function (reqObj) {

    // cloning the token will add a new property extend which signifies extend the time on the token on true or logout on false
      const fieldsToUpdate = Token.clone(reqObj.payload);

    let result = fieldsToUpdate.validateId();
    if (result !== true) {
      throw (helpers.promiseError(400, `Validation failed on token field: ${result}.`));
    }
    result = helpers.validateBool(fieldsToUpdate.extend);
    if (result !== true) {
      throw (helpers.promiseError(400, 'Validation failed on token field: extend.'));
    }
    let tknToUpdate = {};
    try {
      // read the existing token record and use it to build the update
        tknToUpdate = await fDb.read('token', fieldsToUpdate.id);
      if (!helpers.validateObject(tknToUpdate)) {
        throw (helpers.promiseError(409, `Error reading the file record for the token id: ${fieldsToUpdate.id}. Or that token does not exist.`));
      }
    }
    catch (error) {
      helpers.log(`Error thrown trying to read the token id ${fieldsToUpdate.id} during update call. ${error.message}`);
      throw (helpers.promiseError(409, `Error reading the file record for the token: ${fieldsToUpdate.id}. Or that token does not exist.  Reason: ${error.message}`));
    }
    // if caller wants to extend the time on the token
      if (fieldsToUpdate.extend === true) {
      fieldsToUpdate.updateExpiry();
      tknToUpdate.expires = fieldsToUpdate.expires;
      try {
        result = await fDb.update('token', tknToUpdate.id, tknToUpdate);
        if (!result) {
          throw (helpers.promiseError(500, `Error updating the file record for the token id: ${fieldsToUpdate.id}.`));
        }
        result = `Successfully extended the token expiry on token: ${fieldsToUpdate.id}`;
      }
      catch (error) {
        helpers.log(`Error thrown trying to update the token ${fieldsToUpdate.id} during update call. ${error.message}`);
        throw (helpers.promiseError(500, `Error updating the file record for the customer: ${fieldsToUpdate.id}. ${error.message}`));
      }
    }
    // if caller wants to logout
      else {
      try {
        result = await fDb.delete('token', tknToUpdate.id);
        if (!result) {
          throw (helpers.promiseError(500, `Error updating the file record for the token id: ${fieldsToUpdate.id}.`));
        }
        result = `Successfully deleted the token: ${fieldsToUpdate.id}`;
      }
      catch (error) {
        helpers.log(`Error thrown trying to update the token ${fieldsToUpdate.id} during update call. ${error.message}`);
        throw (helpers.promiseError(500, `Error updating the file record for the customer: ${fieldsToUpdate.id}. ${error.message}`));
      }
    }
    return {
      'content_type': 'application/json',
      'statusCode': '200',
      'payload': JSON.stringify(result)
      };
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
      throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
    }
    try {
      result = await fDb.delete('token', tkn.id);
      if (!result) {
        throw (helpers.promiseError(500, `Could not delete the token: ${tkn.id}`));
      }
    }
    catch (error) {
      helpers.log(`Error thrown trying to delete the token ${tkn.id}. ${error.message}`);
      throw (helpers.promiseError(409, `Error deleting the file record for the token: ${tkn.id}. Reason: ${error.message}`));
    }

    return {
      'content_type': 'application/json',
      'statusCode': '200',
      'payload': JSON.stringify(`Successfully deleted the token: ${tkn.id}.`)
      };
  },
  };
