'use strict';

/**
 * @file basketHandler module which implements the shoppingcart functionality
 * @module basketHandler.js
 * @description  basket or cart crud functions. also handles menu request and payment
 * @exports create, read, update, menu and checkOut
 */

const fDb = require('./../lib/fileDb');
const Basket = require('./../Models/basketModel');
const helpers = require('./../public/js/common/helpers');
const { validateCustomerToken, ResponseObj, readBasket, PromiseError } = require('./../utils/handlerUtils');
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
            throw (new PromiseError(400, `Validation failed on basket field: ${result}.`));
        }

        // test to see if customer who placed the basket is in the system
        let customer = {};

        try {
            // read the customer record
            customer = await fDb.read('customer', newBasket.phone);
            if (!helpers.validateObject(customer)) {
                throw (new PromiseError(400, `Error reading the file record for the customer: ${newBasket.phone}, or that customer does not exist.`));
            }
        } catch (error) {
            throw (new PromiseError(500, `Could not read customer record ${newBasket.phone}.`, error));
        }
        // validate the token passed in on the headers
        await validateCustomerToken(reqObj.headers.token);

        // create the id on the basket record
        //newBasket.createId();
        // if we got this far then customer exists and we can slap his frozen pizza in the microwave.
        try {
            await fDb.create('basket', newBasket.id, newBasket.stringify());
        } catch (error) {
            throw (new PromiseError(500, `Could not create new basket. ${newBasket.id} for customer with phone number:  ${newBasket.phone}.`, error));
        }
        const payload = JSON.stringify(newBasket.expires);
        return new ResponseObj(payload, 'basket/create');
    },
    /**
     * @async
     * @summary Summary read function.
     * @description  Reads an existing basket based on data in the reqObj.queryStringObject
     * @param reqObj.queryStringObject - basket id
     * @param headers.token - must have a valid session token to process the read function
     * @returns basket object on success or promise error on failure
     * @throws promise error
     */
    read: async function (reqObj) {

        // validate the token passed in on the headers
        await validateCustomerToken(reqObj.headers.token);

        let basket = await readBasket(reqObj.queryStringObject.id);
        basket = Basket.clone(basket);
        if (!helpers.validateObject(basket)) {
            throw (new PromiseError(500, `Unable to retrieve the basket from the database: ${reqObj.queryStringObject.id}.`));
        }
        const payload = JSON.stringify(basket.stringify());

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
        await validateCustomerToken(reqObj.headers.token);

        // basket id and fields that need to be updated
        const newBasket = Basket.clone(reqObj.payload);

        let result = newBasket.validateId();
        if (result !== true) {
            throw (new PromiseError(400, `Validation failed on basket Id field: ${result}.`));
        }
        let oldBasket = {};
        try {
            oldBasket = await fDb.read('basket', newBasket.id);
            if (!helpers.validateObject(oldBasket)) {
                throw (new PromiseError(400, `Error reading the file record for the basket: ${newBasket.id}, or that basket does not exist.`));
            }
        } catch (error) {
            throw (new PromiseError(500, `Error reading the file record for the basket: ${newBasket.id}, or that basket does not exist.`, error));
        }
        // make a real basket out of this and build the orderCollection
        oldBasket = Basket.clone(oldBasket);

        result = newBasket.shallowCopy(oldBasket);
        if (result !== true) {
            throw (new PromiseError(500, `Copy error. Update failed on basket: ${newBasket.id}.`));
        }

        try {
            // update the customer's basket
            await fDb.update('basket', newBasket.id, newBasket);
        } catch (error) {
            throw (new PromiseError(500, `Error updating the file record for the basket: ${newBasket.id}.`, error));
        }

        const payload = JSON.stringify(`Successfully updated the basket: ${newBasket.id}.`);
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
        await validateCustomerToken(reqObj.headers.token);

        const deleteBasket = new Basket();
        deleteBasket.id = reqObj.queryStringObject.id;

        let result = deleteBasket.validateId();
        if (result !== true) {
            throw (new PromiseError(400, `Validation failed on basket field: ${result}.`));
        }

        try {
            result = await fDb.delete('basket', deleteBasket.id);
            if (!result) {
                throw (new PromiseError(400, `Could not delete the basket: ${deleteBasket.id}`));
            }
        } catch (error) {
            throw (new PromiseError(500, `Error deleting the file record for the basket: ${deleteBasket.id}.`, error));
        }

        const payload = JSON.stringify(`Successfully deleted the  basket: ${deleteBasket.id}.`);
        return new ResponseObj(payload, 'basket/delete');
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
        await validateCustomerToken(reqObj.headers.token);

        // get the basket associated with this token and basket id
        const basket = await readBasket(reqObj.payload.id);
        const total = basket.total;
        let emailMessage = `Successfully processed your charge for an order from the Pizza-Hub for ${total}.`;

        let customer = {};
        try {
            // read the customer record
            customer = await fDb.read('customer', basket.phone);
            if (!helpers.validateObject(customer)) {
                throw (new PromiseError(400, `Error reading the file record for the customer: ${basket.phone}, or that customer does not exist.`));
            }
        } catch (error) {
            throw (new PromiseError(500, `Could not read customer record ${basket.phone}.`, error));
        }

        await payment.process(total, basket.id).catch((error) => {
            const msg = `Error processing the charge for basket: ${basket.id}.`;
            throw (new PromiseError('500', msg, error));
        });
        // oops gonna get a phone call form an irate customer if this also
        await email.send(basket.id, customer.email, emailMessage).catch((error) => {
            const msg = `Error sending update email to the client for basket: ${basket.id}.`;
            throw (new PromiseError('500', msg, error));
        });

        const payload = JSON.stringify(`Charge successful for basket id: ${basket.id}.`);
        return new ResponseObj(payload, 'basket/checkOut');
    }
};
