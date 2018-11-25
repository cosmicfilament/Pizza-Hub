'use strict';

/**
 * @file customerHandler module
 * @module customerHandler.js
 * @description  customer CRUD module
 * @exports create, read, update and delete functions
 */

const fDb = require('./../lib/fileDb');
const helpers = require('./../public/js/common/helpers');
const {
    validateCustomerToken,
    ResponseObj,
    PromiseError
} = require('./../utils/handlerUtils');
const {
    Customer
} = require('./../Models/customerModel');

module.exports = {
    /**
     * @async
     * @summary Customer create function.
     * @description  Creates a new customer based on data in the reqObj.payload. The phone number passed in is the key(file name) on the record.
     * @param reqObj - payload passes in firstName, lastName, email, address, password and phone. See customerModel
     * @returns JSON string with success msg or promise error on failure
     * @throws promise error
     */
    create: async function (reqObj) {

        const cust = Customer.clone(reqObj.payload);
        let result = cust.validateCustomer();
        if (result !== true) {
            throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
        }
        // create a password hash for the customer
        const hashedPwd = Customer.createPasswordHash(cust.password);
        if (!hashedPwd) {
            throw (new PromiseError(500, 'Could not hash the customer\'s password.'));
        }
        // from this point on the password is no longer clear text
        cust.password = hashedPwd;

        try {
            // now save the new customer to the file db.
            await fDb.create('customer', cust.phone, cust);
        } catch (error) {
            throw (new PromiseError(500, `Could not create new customer record ${cust.phone}.`, error));
        }
        const payload = JSON.stringify(`Succeeded in creating file record for customer:  ${cust.phone}.`);

        return new ResponseObj(payload, 'customer/create');
    },
    /**
     * @async
     * @summary Customer read function
     * @description  Reads a customer record from the file db and returns it to the caller
     * @param reqObj - the phone number is passed in on the querystring
     * @param headers.token - must have a valid session token to process the read function
     * @returns the customer record as a JSON string or promise error on failure
     * @throws promise error
     */

    read: async function (reqObj) {

        const cust = new Customer();
        cust.phone = reqObj.queryStringObject.phone;

        let result = cust.validatePhone();
        if (result !== true) {
            throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
        }

        // validate the token passed in on the headers
        await validateCustomerToken(reqObj.headers.token);

        try {
            // read the customer record
            result = await fDb.read('customer', cust.phone);
            if (!helpers.validateObject(result)) {
                throw (new PromiseError(400, `Could not read customer record ${cust.phone}.  Account does not exist.`));
            }
        } catch (error) {
            throw (new PromiseError(400, `Could not read customer record ${cust.phone}.  Account does not exist.`, error));
        }
        // don't transmit the pasword even if it is a hash
        result.password = '';

        const payload = JSON.stringify(result);
        return new ResponseObj(payload, 'customer/read');
    },
    /**
     * @async
     * @summary Customer update function.
     * @description  Allows the caller to update firstName, LastName, address, password and email on existing customer
     * @param reqObj - payload passes in firstName, lastName, email, address, password and phone. See customerModel
     * @param headers.token - must have a valid session token to process the update function
     * @returns success message or promise error on failure
     * @throws promise error
     */
    update: async function (reqObj) {

        const fieldsToUpdate = Customer.clone(reqObj.payload);

        let result = fieldsToUpdate.validatePhone();
        if (result !== true) {
            throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
        }

        // validate the token passed in on the headers
        await validateCustomerToken(reqObj.headers.token);

        let custToUpdate = {};
        try {
            // read the existing customer record and use it to build the update
            custToUpdate = await fDb.read('customer', fieldsToUpdate.phone);
            if (!helpers.validateObject(custToUpdate)) {
                throw (new PromiseError(400, `Error reading the file record for the customer: ${fieldsToUpdate.phone}. Or that customer does not exist.`));
            }
        } catch (error) {
            throw (new PromiseError(500, `Error reading the file record for the customer: ${fieldsToUpdate.phone}`, error));
        }

        // test that there is atleast one update to make, validate it(them) and update the custToUpdate record with the changed field(s)
        let dirtyFlag = false;

        if (fieldsToUpdate.firstName !== '') {
            result = fieldsToUpdate.validateFirstName();
            if (result !== true) {
                throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.firstName = fieldsToUpdate.firstName;
        }

        if (fieldsToUpdate.lastName !== '') {
            result = fieldsToUpdate.validateLastName();
            if (result !== true) {
                throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.lastName = fieldsToUpdate.lastName;
        }

        if (fieldsToUpdate.email !== '') {
            result = fieldsToUpdate.validateEmail();
            if (result !== true) {
                throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.email = fieldsToUpdate.email;
        }

        if (fieldsToUpdate.password !== '') {
            result = fieldsToUpdate.validatePassword();
            if (result !== true) {
                throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
            }
            dirtyFlag = true;
            // create a password hash for the new password
            const hashedPwd = Customer.createPasswordHash(fieldsToUpdate.password);
            if (!hashedPwd) {
                throw (new PromiseError(500, 'Could not hash the user\'s password.'));
            }
            // password is no longer clear text.
            custToUpdate.password = hashedPwd;
        }

        if (fieldsToUpdate.address !== '') {
            result = fieldsToUpdate.validateAddress();
            if (result !== true) {
                throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.address = fieldsToUpdate.address;
        }

        // if no data changed then no update
        if (!dirtyFlag) {
            throw (new PromiseError(400, `Nothing to update. Data did not change for customer with phone number: ${fieldsToUpdate.phone}`));
        }

        try {
            // else update the customer record
            await fDb.update('customer', custToUpdate.phone, custToUpdate);
        } catch (error) {
            throw (new PromiseError(500, `Error updating the file record for the customer: ${custToUpdate.phone}.`, error));
        }

        const payload = JSON.stringify(`Successfully update the customer: ${custToUpdate.phone}.`);

        return new ResponseObj(payload, 'customer/update');
    },
    /**
     * @async
     * @summary Customer delete function.
     * @description  Allows the caller to delete an existing customer record(file)
     * @param reqObj - phone is passed in on the querystring
     * @param headers.token - must have a valid session token to process the delete function
     * @returns success message or promise error on failure
     * @throws promise error
     */
    delete: async function (reqObj) {
        const cust = new Customer();
        cust.phone = reqObj.queryStringObject.phone;

        let result = cust.validatePhone();
        if (result !== true) {
            throw (new PromiseError(400, `Validation failed on customer field: ${result}.`));
        }

        // validate the token passed in on the headers
        await validateCustomerToken(reqObj.headers.token);

        try {
            result = await fDb.delete('customer', cust.phone);
            if (!result) {
                throw (new PromiseError(400, `Could not delete the customer: ${cust.phone}`));
            }
        } catch (error) {
            throw (new PromiseError(500, `Error deleting the file record for the customer: ${cust.phone}.`, error));
        }

        const payload = JSON.stringify(`Successfully deleted the customer: ${cust.phone}.`);
        return new ResponseObj(payload, 'customer/delete');
    },
};
