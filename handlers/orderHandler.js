'use strict';

/*
*
* Order record
*
*/

const fDb = require('../lib/fileDb');
const helpers = require('../lib/helpers');
const { Customer } = require('../Models/customerModel');
const { Order } = require('../Models/orderModel');

module.exports = {
    create: async function (reqObj) {

        const newOrder = Order.clone(reqObj.payload);
        let result = newOrder.validateOrder(true);
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
        }

        // test to see if customer exists
        try {
            // read the customer record
            result = await fDb.read('customer', newOrder.phone);
            if (!helpers.validateObject(result)) {
                throw (helpers.promiseError(409, `Error reading the file record for the customer: ${newOrder.phone}. Or that customer does not exist. Cannot process this pizza order.`));
            }
        }
        catch (error) {
            helpers.log(`Error when validating pizza order. Error thrown trying to read the customer ${newOrder.phone}. ${error.message}`);
            throw (helpers.promiseError(409, `Error when validating pizza order. Could not read customer record ${newOrder.phone}. Reason: ${error.message}`));
        }

        // create the id on the order record
        newOrder.createId(helpers.createRandomString());

        // if we got this far then customer exists and we can slap his frozen pizza in the microwave.
        try {
            // now save the new pizza order to the file db.
            await fDb.create('order', newOrder.id, newOrder);
        }
        catch (error) {
            helpers.log(`Error thrown trying to create new pizza order ${newOrder.id}. ${error.message}`);
            throw (helpers.promiseError(409, `Could not create new pizza order. ${newOrder.id}. Reason: ${error.message}`));
        }
        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Succeeded in creating pizza order ${newOrder.id} for customer with phone number:  ${newOrder.phone}.`)
        };
    },

    read: async function (reqObj) {

        const newOrder = new Order();
        newOrder.id = reqObj.queryStringObject.id;

        let result = newOrder.validateId(false);
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on pizza order field: ${result}.`));
        }

        try {
            // read the order record
            result = await fDb.read('order', newOrder.id);
            if (!helpers.validateObject(result)) {
                throw (helpers.promiseError(409, `Error reading the file record for the pizza order: ${newOrder.id}. Or that order does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to read the pizza order ${newOrder.id}. ${error.message}`);
            throw (helpers.promiseError(409, `Could not read pizza order record ${newOrder.id}. Reason: ${error.message}`));
        }

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(result)
        };
    },

    update: async function (reqObj) {

        const fieldsToUpdate = Order.clone(reqObj.payload);

        let result = fieldsToUpdate.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on Id field: ${result}.`));
        }
        let orderToUpdate = {};
        try {
            // read the existing customer record and use it to build the update
            orderToUpdate = await fDb.read('order', fieldsToUpdate.id);
            if (!helpers.validateObject(orderToUpdate)) {
                throw (helpers.promiseError(409, `Error reading the file record for the pizza order: ${fieldsToUpdate.id}. Or that order does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to read the pizza order ${fieldsToUpdate.id} during update call. ${error.message}`);
            throw (helpers.promiseError(409, `Error reading the file record for the pizza order: ${fieldsToUpdate.id}. Or that order does not exist.  Reason: ${error.message}`));
        }

        // tests that there is atleast one update to make, validates it(them) and updates the orderToUpdate record with the changed field(s)
        let dirtyFlag = false;

        if (fieldsToUpdate.sizes !== '') {
            result = fieldsToUpdate.validatePizzaSize();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
            }
            dirtyFlag = true;
            orderToUpdate.sizes = fieldsToUpdate.sizes;
        }

        if (fieldsToUpdate.toppings !== '') {
            result = fieldsToUpdate.validateToppings();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
            }
            dirtyFlag = true;
            orderToUpdate.toppings = fieldsToUpdate.toppings;
        }

        // if no data changed then no update
        if (!dirtyFlag) {
            throw (helpers.promiseError(400, 'Nothing to update. Data did not change for the pizza order: '));
        }

        try {
            // else update the customer record
            await fDb.update('order', orderToUpdate.id, orderToUpdate);
        }
        catch (error) {
            helpers.log(`Error thrown trying to update the pizza order ${orderToUpdate.id} during update call. ${error.message}`);
            throw (helpers.promiseError(500, `Error updating the file record for the pizza order: ${orderToUpdate.id}. ${error.message}`));
        }

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Successfully update the pizza order: ${orderToUpdate.id}.`)
        };
    },

    delete: async function (reqObj) {

        const deleteOrder = new Order();
        deleteOrder.id = reqObj.queryStringObject.id;

        let result = deleteOrder.validateId();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
        }

        try {
            result = await fDb.delete('order', deleteOrder.id);
            if (!result) {
                throw (helpers.promiseError(500, `Could not delete the pizza order: ${deleteOrder.id}`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to delete the pizza order ${deleteOrder.id}. ${error.message}`);
            throw (helpers.promiseError(409, `Error deleting the file record for the pizza order: ${deleteOrder.id}. Reason: ${error.message}`));
        }

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Successfully deleted the pizza order: ${deleteOrder.id}.`)
        };

    },

    // this should really be in a file so that it can be easily modified as the menu changes.
    menu: async function (reqObj) {

        const cust = new Customer();
        cust.phone = reqObj.queryStringObject.phone;

        let result = cust.validatePhone();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
        }

        try {
            result = await fDb.read('customer', cust.phone);
            if (!helpers.validateObject(result)) {
                throw (helpers.promiseError(409, `Error reading the file record for the customer: ${cust.phone}. Or that customer does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to read the customer ${cust.phone}. ${error.message}`);
            throw (helpers.promiseError(409, `Could not read customer record ${cust.phone}. Reason: ${error.message}`));
        }

        // we made it this far so obviously the customer exists.
        const menu = {
            "Pizza Sizes": Order.sizesArray,
            "Toppings": Order.toppingsArray
        };

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(menu)
        };
    }
};
