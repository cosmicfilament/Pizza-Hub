'use strict';

/**
    * @file basketHandler module which implements the shoppingcart functionality
    * @module basketHandler.js
    * @description  basket or cart crud functions. also handles menu request and payment
    * @exports create, read, update, menu and checkOut
*/

const fDb = require('./../lib/fileDb');
const { Basket } = require('./../Models/basketModel');
const helpers = require('./../utils/helpers');
const utils = require('./../utils/handlerUtils');
const email = require('./../utils/mailGun');
const payment = require('./../utils/stripe');

module.exports = {
    /**
         * @async
         * @summary Basket create function.
         * @description  Creates a new basket based on data in the reqObj.payload.
         * @param reqObj.payload (phone)- payload passes in the values used to create a new basket
         * @param headers.token - must have a valid session token to process the create function
         * @returns success msg or promise error on failure
         * @throws promise error
    */
    create: async function (reqObj) {

        const newBasket = Basket.clone(reqObj.payload);
        // validate basket phone number which is the only value passed in the payload
        let result = newBasket.validatePhone();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on basket field: ${result}.`));
        }

        // test to see if customer who placed the basket is in the system
        let customer = {};

        try {
            // read the customer record
            customer = await fDb.read('customer', newBasket.phone);
            if (!helpers.validateObject(customer)) {
                throw (helpers.promiseError(400, `Error reading the file record for the customer: ${newBasket.phone}, or that customer does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error validating basket. Error thrown trying to read the customer ${newBasket.phone}. ${error.message}`);
            throw (helpers.promiseError(500, `Error validating basket. Could not read customer record ${newBasket.phone}. Reason: ${error.message}`));
        }
        // validate the token passed in on the headers
        result = await utils.validateCustomerToken(reqObj.headers.token);
        if (result !== true) {
            throw (helpers.promiseError(400, result));
        }

        newBasket.email = customer.email;
        // create the id on the basket record
        newBasket.createId();
        // if we got this far then customer exists and we can slap his frozen pizza in the microwave.
        try {
            await fDb.create('basket', newBasket.id, newBasket);
        }
        catch (error) {
            helpers.log(`Error thrown trying to create new basket ${newBasket.id} for customer with phone number:  ${newBasket.phone}. ${error.message}`);
            throw (helpers.promiseError(400, `Could not create new basket. ${newBasket.id} for customer with phone number:  ${newBasket.phone}. Reason: ${error.message}`));
        }
        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Succeeded in creating basket ${newBasket.id} for customer with phone number: ${newBasket.phone}.`)
        };
    },
    /**
         * @async
         * @summary Basket read function.
         * @description  Reads an existing basket based on data in the reqObj.queryStringObject
         * @param reqObj.queryStringObject - basket id
         * @param headers.token - must have a valid session token to process the read function
         * @returns basket object on success or promise error on failure
         * @throws promise error
    */
    read: async function (reqObj) {

        // validate the token passed in on the headers
        let result = await utils.validateCustomerToken(reqObj.headers.token);
        if (result !== true) {
            throw (helpers.promiseError(400, result));
        }

        const basket = await utils.readBasket(reqObj.queryStringObject.id);

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(basket)
        };
    },
    /**
         * @async
         * @summary Basket update function.
         * @description  Updates the # of order items in a basket. Can either add or delete order items.
         * @param reqObj.payload - passes in basket id and and array of order items
         * @param headers.token - must have a valid session token to process the update function
         * @returns success msg or promise error on failure
         * @throws promise error
    */
    update: async function (reqObj) {

        // validate the token passed in on the headers
        let result = await utils.validateCustomerToken(reqObj.headers.token);
        if (result !== true) {
            throw (helpers.promiseError(400, result));
        }

        // basket id and fields that need to be updated
        const fieldsToUpdate = Basket.clone(reqObj.payload);

        result = fieldsToUpdate.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on basket Id field: ${result}.`));
        }
        let basketToUpdate = {};
        try {
            // read the existing basket record and use it to build the update
            basketToUpdate = await fDb.read('basket', fieldsToUpdate.id);
            if (!helpers.validateObject(basketToUpdate)) {
                throw (helpers.promiseError(400, `Error reading the file record for the basket: ${fieldsToUpdate.id}, or that basket does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to read the basket ${fieldsToUpdate.id}. Reason: ${error.message}`);
            throw (helpers.promiseError(400, `Error reading the file record for the basket: ${fieldsToUpdate.id}, or that basket does not exist.  Reason: ${error.message}`));
        }

        // test that there is atleast one update to make. The only items allowed to change (update) are order items.
        let dirtyFlag = false;

        if (fieldsToUpdate.size !== '') {
            result = fieldsToUpdate.validateorderSelections();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on basket field: ${result}.`));
            }
            dirtyFlag = true;
            basketToUpdate.orderSelections = fieldsToUpdate.orderSelections;
        }

        // if no data changed then no update
        if (!dirtyFlag) {
            throw (helpers.promiseError(400, `Nothing to update. Data did not change for the basket: ${fieldsToUpdate.id}`));
        }

        try {
            // else update the customer record
            await fDb.update('basket', basketToUpdate.id, basketToUpdate);
        }
        catch (error) {
            helpers.log(`Error thrown trying to update the basket ${basketToUpdate.id}. Reason: ${error.message}`);
            throw (helpers.promiseError(500, `Error updating the file record for the basket: ${basketToUpdate.id}. Reason: ${error.message}`));
        }

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Successfully update the basket: ${basketToUpdate.id}.`)
        };
    },
    /**
         * @async
         * @summary Basket delete function.
         * @description  Deletes a basket with the basket id passed in the querystring
         * @param reqObj.queryStringObject - used to retrieve the basket id.
        * @param headers.token - must have a valid session token to process the delete function
         * @returns success msg or promise error on failure
         * @throws promise error
    */
    delete: async function (reqObj) {

        // validate the token passed in on the headers
        let result = await utils.validateCustomerToken(reqObj.headers.token);
        if (result !== true) {
            throw (helpers.promiseError(400, result));
        }

        const deleteBasket = new Basket();
        deleteBasket.id = reqObj.queryStringObject.id;

        result = deleteBasket.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on basket field: ${result}.`));
        }

        try {
            result = await fDb.delete('basket', deleteBasket.id);
            if (!result) {
                throw (helpers.promiseError(500, `Could not delete the basket: ${deleteBasket.id}`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to delete the basket ${deleteBasket.id}. Reason: ${error.message}`);
            throw (helpers.promiseError(400, `Error deleting the file record for the basket: ${deleteBasket.id}. Reason: ${error.message}`));
        }

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Successfully deleted the  basket: ${deleteBasket.id}.`)
        };
    },
    /**
         * @async
         * @summary menu function
         * @description  no validation. allows anyone to read the menu
         * @returns the restaurant's menu
    */
    menu: async function () {

        const app = require('./../index');
        const menu = app.menu;

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(menu)
        };
    },

    /**
         * @async
         * @summary checkOut function
         * @description  validates the basket, totals it and sends it to stripe for payment processing. at the end it sends an email to the customer with a status message
         * @param reqObj.payload.id - used to retrieve the basket id.
        * @param headers.token - must have a valid session token to process the checkOut function
         * @returns success msg or promise error on failure
         * @throws promise error
    */
    // post - basket id is in the body
    checkOut: async function (reqObj) {

        // validate the token passed in on the headers
        let result = await utils.validateCustomerToken(reqObj.headers.token);
        if (result !== true) {
            throw (helpers.promiseError(400, result));
        }

        // get the basket associated with this token and basket id
        const basket = await utils.readBasket(reqObj.payload.id);
        const total = basket.total;
        let msg = `Successfully processed your charge for an order from the Pizza-Hub for ${total}.`;

        try {
            await payment.process(total, basket.id);
            // oops gonna get a phone call form an irate customer if this also
            await email.send(basket.id, basket.email, msg);
        }
        catch (error) {
            msg = `Error trying to process the credit card charge ${basket.id}. Reason: ${error.message}`;
            helpers.log('red', msg);
            throw (helpers.promiseError(500, msg));
        }
        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Charge successful for basket id: ${basket.id}.`)
        };
    }
};
