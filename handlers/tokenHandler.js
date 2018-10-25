'use strict';

/*
*
* token record
*
*/

const fDb = require('../lib/fileDb');
const helpers = require('../lib/helpers');

const { Customer, CUST_ENUMS } = require('../Models/customerModel');
const { Token, TOKEN_ENUMS } = require('../Models/tokenModel');

module.exports = {
    // pass in the customer phone number and password in order to get a token back
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
        const hashedPwdToValidate = helpers.hash(custFromReqObj.password, CUST_ENUMS.MINIMUM_PASSWORD_LENGTH);
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
        const newToken = new Token(helpers.createRandomString(), custInDb.phone);
        //not sure how this could happen
        if (newToken.validateToken() !== true) {
            helpers.log(`Error thrown trying to create new token ${newToken.id} for customer ${custInDb.phone}.`);
            throw (helpers.promiseError(500, `Server error creating a token for customer with phone number: ${custInDb.phone}.`));
        }
        // save it to the file
        try {
            // now save the new customer to the file db.
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

    read: async function (reqObj) {

        const tkn = new Token(reqObj.queryStringObject.id);
        let result = tkn.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
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
    // id and boolean that signifies whether to extend the token or logout
    update: async function (reqObj) {

        // cloning the token will add a new property extend which signifies extend on true and logout on false
        const fieldsToUpdate = Token.clone(reqObj.payload);

        let result = fieldsToUpdate.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
        }
        result = helpers.validateBool(fieldsToUpdate.extend);
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: extend.`));
        }
        let tknToUpdate = {};
        try {
            // read the existing customer record and use it to build the update
            tknToUpdate = await fDb.read('token', fieldsToUpdate.id);
            if (!helpers.validateObject(tknToUpdate)) {
                throw (helpers.promiseError(409, `Error reading the file record for the token id: ${fieldsToUpdate.id}. Or that token does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to read the token id ${fieldsToUpdate.id} during update call. ${error.message}`);
            throw (helpers.promiseError(409, `Error reading the file record for the token: ${fieldsToUpdate.id}. Or that token does not exist.  Reason: ${error.message}`));
        }
        if (fieldsToUpdate.extend === true) {
            fieldsToUpdate.updateExpiry();
            tknToUpdate.expires = fieldsToUpdate.expires;
            try {
                result = await fDb.update('token', tknToUpdate.id, tknToUpdate);
                if (!result) {
                    throw (helpers.promiseError(500, `Error updating the file record for the token id: ${fieldsToUpdate.id}.`));
                }
                result = `Successfully extended the token: ${fieldsToUpdate.id}`;
            }
            catch (error) {
                helpers.log(`Error thrown trying to update the token ${fieldsToUpdate.id} during update call. ${error.message}`);
                throw (helpers.promiseError(500, `Error updating the file record for the customer: ${fieldsToUpdate.id}. ${error.message}`));
            }
        }
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

    delete: async function (reqObj) {
        const tkn = new Token(reqObj.payload.id);
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

    list: async function (reqObj) {


    }

};
