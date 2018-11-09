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
const { validateCustomerToken, ResponseObj, readBasket } = require('./../utils/handlerUtils');
const email = require('../vendor/mailGun');
const payment = require('../vendor/stripe');

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
            throw (helpers.promiseError(500, `Error validating basket. Could not read customer record ${newBasket.phone}. Reason: ${error.message}`));
        }
        // validate the token passed in on the headers
        result = await validateCustomerToken(reqObj.headers.token);
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
            throw (helpers.promiseError(400, `Could not create new basket. ${newBasket.id} for customer with phone number:  ${newBasket.phone}. Reason: ${error.message}`));
        }
        const payload = JSON.stringify(`Succeeded in creating basket ${newBasket.id} for customer with phone number: ${newBasket.phone}.`);
        return new ResponseObj(payload, 'basket/create');
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
        let result = await validateCustomerToken(reqObj.headers.token);
        if (result !== true) {
            throw (helpers.promiseError(400, result));
        }

        const basket = await readBasket(reqObj.queryStringObject.id);
        const payload = JSON.stringify(basket);
        return new ResponseObj(payload, 'basket/read');
    },
    /**
    * @async
    * @summary Basket update function.
    * @description  Updates the # of order selections in a basket. Can either add or delete order selections.
    * @param reqObj.payload - passes in basket id and and array of order selections
    * @param headers.token - must have a valid session token to process the update function
    * @returns success msg or promise error on failure
    * @throws promise error
    */
    update: async function (reqObj) {

        // validate the token passed in on the headers
        let result = await validateCustomerToken(reqObj.headers.token);
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
            throw (helpers.promiseError(400, `Error reading the file record for the basket: ${fieldsToUpdate.id}, or that basket does not exist.  Reason: ${error.message}`));
        }
        // make a real basket out of this and build the orderCollection
        basketToUpdate = Basket.clone(basketToUpdate);

        // test that there is atleast one update to make. The only items allowed to change (update) are order selections.
        let dirtyFlag = false;

        if (fieldsToUpdate.size !== '') {
            result = fieldsToUpdate.validateOrderCollection();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on basket field: ${result}.`));
            }
            dirtyFlag = true;
            basketToUpdate.deepCopyOrderCollection(fieldsToUpdate.orderCollection);
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
            throw (helpers.promiseError(500, `Error updating the file record for the basket: ${basketToUpdate.id}. Reason: ${error.message}`));
        }

        const payload = JSON.stringify(`Successfully update the basket: ${basketToUpdate.id}.`);
        return new ResponseObj(payload, 'basket/update');
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
        let result = await validateCustomerToken(reqObj.headers.token);
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
            throw (helpers.promiseError(400, `Error deleting the file record for the basket: ${deleteBasket.id}. Reason: ${error.message}`));
        }

        const payload = JSON.stringify(`Successfully deleted the  basket: ${deleteBasket.id}.`);
        return new ResponseObj(payload, 'basket/delete');
    },
    /**
    * @async
    * @summary menu function
    * @description  no validation. allows anyone to read the menu
    * @returns the restaurant's menu
    */
    menu: async function () {

        const app = require('../index');
        const menu = app.menu;

        const payload = JSON.stringify(menu);
        return new ResponseObj(payload, 'basket/menu');
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
        let result = await validateCustomerToken(reqObj.headers.token);
        if (result !== true) {
            throw (helpers.promiseError(400, result));
        }

        // get the basket associated with this token and basket id
        const basket = await readBasket(reqObj.payload.id);
        const total = basket.total;
        let emailMessage = `Successfully processed your charge for an order from the Pizza-Hub for ${total}.`;

        await payment.process(total, basket.id).catch((error) => {
            const msg = `Error processing the charge for basket: ${basket.id}. Reason: ${error}`;
            throw (helpers.promiseError('500', msg));
        });
        // oops gonna get a phone call form an irate customer if this also
        await email.send(basket.id, basket.email, emailMessage).catch((error) => {
            const msg = `Error sending update email to the client for basket: ${basket.id}. Reason: ${error}`;
            throw (helpers.promiseError('500', msg));
        });

        const payload = JSON.stringify(`Charge successful for basket id: ${basket.id}.`);
        return new ResponseObj(payload, 'basket/checkOut');
    }
};
