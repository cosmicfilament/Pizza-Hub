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
const templateFactory = require('./../lib/templates/templateFactory');
//const email = require('../vendor/mailGun');
//const payment = require('../vendor/stripe');

module.exports = {

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
        await validateCustomerToken(reqObj.headers.token);

        let basket = await readBasket(reqObj.queryStringObject.id);
        basket = Basket.clone(basket);
        if (!helpers.validateObject(basket)) {
            throw (new PromiseError(500, `Unable to retrieve the basket from the database: ${reqObj.queryStringObject.id}.`));
        }

        const payload = templateFactory.buildSummaryContent(basket.orderCollection);
        if (!helpers.validateString(payload)) {
            throw (new PromiseError(500, `Unable to retrieve the basket from the database: ${reqObj.queryStringObject.id}.`));
        }
        return new ResponseObj(JSON.stringify(payload), 'basket/read');
    },

    orderSummaryFrm: async function (reqObj) {

        let basketId = reqObj.queryStringObject.basketId;
        let basket = false;

        // swallow any read error and just return an empty form to the client
        try {
            basket = await readBasket(basketId);
        }
        catch (error) {
            helpers.log('red', 'basket not found.');
            basket = false;
            basketId = '';
        }

        if (basket) {
            basket = Basket.clone(basket);
            if (!helpers.validateObject(basket)) {
                throw (new PromiseError(500, `Unable to retrieve the basket from the database: ${basketId}.`));
            }
        }

        let navigation = templateFactory.getTemplate('navigation');
        navigation = navigation.replace('/orderSummaryFrm', `/orderSummaryFrm?basketId=${basketId}`);

        const body = templateFactory.buildSummaryContent((basket !== false) ? basket.orderCollection : []);
        if (!helpers.validateString(body)) {
            throw (new PromiseError(500, `Unable to retrieve the basket from the database: ${basketId}.`));
        }

        const payloadStr = templateFactory.buildWebPage(body, 'orderSummaryFrm', navigation);

        return new ResponseObj(payloadStr, 'session/orderSummaryFrm', 'text/html');
    },

    delete: async function (reqObj) {


        // validate the token passed in on the headers
        await validateCustomerToken(reqObj.headers.token);

        const basketId = reqObj.queryStringObject.basketId;
        const itemId = reqObj.payload.itemId;
        const choiceId = reqObj.payload.choiceId;

        let basket = await readBasket(basketId);
        basket = Basket.clone(basket);
        if (!helpers.validateObject(basket)) {
            throw (new PromiseError(400, `Unable to delete the item from the database: ${basketId}:${itemId}:${choiceId}.`));
        }

        let collection = basket.orderCollection;
        if (!collection.MapDeleteElement(itemId, choiceId)) {
            throw (new PromiseError(400, `Unable to delete the item from the database: ${basketId}:${itemId}:${choiceId}.`));
        }

        if (collection.size) {
            const newBasket = Basket.clone(collection);
            if (!helpers.validateObject(newBasket)) {
                throw (new PromiseError(400, `Unable to delete the item from the database: ${basketId}:${itemId}:${choiceId}.`));
            }

            try {
                // update the customer's basket
                await fDb.update('basket', newBasket.id, newBasket.stringify());
            } catch (error) {
                throw (new PromiseError(500, `Error updating the file record during delete for the basket: ${basketId}.`, error));
            }
        }
        else {
            try {
                // update the customer's basket
                await fDb.delete('basket', basketId);
            } catch (error) {
                throw (new PromiseError(500, `Error updating the file record during delete of the basket: ${basketId}.`, error));
            }
        }
        const payload = JSON.stringify(collection.size);

        return new ResponseObj(payload, 'summary/delete', 'text/html');
    },
};
