'use strict';

/*
*
* customer record for login and delivery location
*
*/

const fDb = require('../lib/fileDb');
const helpers = require('../lib/helpers');

const { Customer, CUST_ENUMS } = require('../Models/customerModel');


module.exports = {
    create: async function (reqObj) {

        const cust = Customer.clone(reqObj.payload);
        let result = cust.validateCustomer();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on customer field: ${result}.`));
        }
        // create a password hash for the customer
        const hashedPwd = helpers.hash(cust.password, CUST_ENUMS.MINIMUM_PASSWORD_LENGTH);
        if (!hashedPwd) {
            throw (helpers.promiseError(500, 'Could not hash the customer\'s password.'));
        }
        cust.password = hashedPwd;

        try {
            // now save the new customer to the file db.
            await fDb.create('customer', cust.phone, cust);
        }
        catch (error) {
            helpers.log(`Error thrown trying to create new customer ${cust.phone}. ${error.message}`);
            throw (helpers.promiseError(409, `Could not create new customer record ${cust.phone}. Reason: ${error.message}`));
        }
        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Succeeded in creating file record for customer:  ${cust.phone}.`)
        };
    },

    read: async function (reqObj) {

        const cust = new Customer();

        cust.phone = reqObj.queryStringObject.phone;

        let result = cust.validatePhone();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
        }

        try {
            // read the customer record
            result = await fDb.read('customer', cust.phone);
            if (!helpers.validateObject(result)) {
                throw (helpers.promiseError(409, `Error reading the file record for the customer: ${cust.phone}. Or that customer does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to read the customer ${cust.phone}. ${error.message}`);
            throw (helpers.promiseError(409, `Could not read customer record ${cust.phone}. Reason: ${error.message}`));
        }

        // don't transmit the pasword even if it is a hash
        result.password = '';

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(result)
        };
    },

    update: async function (reqObj) {

        const fieldsToUpdate = Customer.clone(reqObj.payload);

        let result = fieldsToUpdate.validatePhone();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
        }
        let custToUpdate = {};
        try {
            // read the existing customer record and use it to build the update
            custToUpdate = await fDb.read('customer', fieldsToUpdate.phone);
            if (!helpers.validateObject(custToUpdate)) {
                throw (helpers.promiseError(409, `Error reading the file record for the customer: ${fieldsToUpdate.phone}. Or that customer does not exist.`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to read the customer ${fieldsToUpdate.phone} during update call. ${error.message}`);
            throw (helpers.promiseError(409, `Error reading the file record for the customer: ${fieldsToUpdate.phone}. Or that customer does not exist.  Reason: ${error.message}`));
        }

        // tests that there is atleast one update to make, validates it(them) and updates the custToUpdate record with the changed field(s)
        let dirtyFlag = false;

        if (fieldsToUpdate.firstName !== '') {
            result = fieldsToUpdate.validateFirstName();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.firstName = fieldsToUpdate.firstName;
        }

        if (fieldsToUpdate.lastName !== '') {
            result = fieldsToUpdate.validateLastName();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.lastName = fieldsToUpdate.lastName;
        }

        if (fieldsToUpdate.email !== '') {
            result = fieldsToUpdate.validateEmail();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.email = fieldsToUpdate.email;
        }

        if (fieldsToUpdate.password !== '') {
            result = fieldsToUpdate.validatePassword();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
            }
            dirtyFlag = true;
            // create a password hash for the new password
            const hashedPwd = helpers.hash(fieldsToUpdate.password, CUST_ENUMS.MINIMUM_PASSWORD_LENGTH);
            if (!hashedPwd) {
                throw (helpers.promiseError(500, 'Could not hash the user\'s password.'));
            }
            custToUpdate.password = hashedPwd;
        }

        if (fieldsToUpdate.address !== '') {
            result = fieldsToUpdate.validateAddress();
            if (result !== true) {
                throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
            }
            dirtyFlag = true;
            custToUpdate.address = fieldsToUpdate.address;
        }

        // if no data changed then no update
        if (!dirtyFlag) {
            throw (helpers.promiseError(400, 'Nothing to update. Data did not change for customer: '));
        }

        try {
            // else update the customer record
            await fDb.update('customer', custToUpdate.phone, custToUpdate);
        }
        catch (error) {
            helpers.log(`Error thrown trying to update the customer ${custToUpdate.phone} during update call. ${error.message}`);
            throw (helpers.promiseError(500, `Error updating the file record for the customer: ${custToUpdate.phone}. ${error.message}`));
        }

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Successfully update the customer: ${custToUpdate.phone}.`)
        };
    },

    delete: async function (reqObj) {
        const cust = new Customer();
        cust.phone = reqObj.queryStringObject.phone;

        let result = cust.validatePhone();
        if (result !== true) {
            throw (helpers.promiseError(400, `Validation failed on field: ${result}.`));
        }

        try {
            result = await fDb.delete('customer', cust.phone);
            if (!result) {
                throw (helpers.promiseError(500, `Could not delete the customer: ${cust.phone}`));
            }
        }
        catch (error) {
            helpers.log(`Error thrown trying to delete the customer ${cust.phone}. ${error.message}`);
            throw (helpers.promiseError(409, `Error deleting the file record for the customer: ${cust.phone}. Reason: ${error.message}`));
        }

        return {
            'content_type': 'application/json',
            'statusCode': '200',
            'payload': JSON.stringify(`Successfully deleted the customer: ${cust.phone}.`)
        };
    },

    // list: async function (reqObj) {

    // }
};
