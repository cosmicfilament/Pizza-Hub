'use strict';

/**
 * @file stripe file for processing credit card charges
 * @module stripe.js
 *
 */

const https = require('https');
const queryString = require('querystring');
const { PromiseError } = require('./../utils/handlerUtils');
const { CONFIG } = require('../lib/config');
const logs = require('./../utils/logs');

// pretty much just copied the twilio stuff and changed a few lines.
// oh and googled my butt off to stackoverflow and this:
// https://en.wikipedia.org/wiki/Basic_access_authentication
// https://stripe.com/docs/api/authentication?lang=curl
// https://curl.haxx.se/docs/httpscripting.html#POST
// https://github.com/acudev-longnguyen/homework-assignment2.git

module.exports = {
    /**
     * @async
     * @summary process
     * @description processes payment via stripe.com
     * @param total in dollars
     * @param basket id
     * @returns success or fail
     * @throws promise reject
     */
    process: async function (total, id) {
        return new Promise((resolve, reject) => {
            // Configure the request payload
            const payload = {
                'amount': total,
                'currency': 'usd',
                'description': 'Pizza-Hub',
                'source': 'tok_visa'
            };
            const strPayload = queryString.stringify(payload);
            // Configure the request details
            const requestDetails = {
                'protocol': 'https:',
                'hostname': 'api.stripe.com',
                'method': 'POST',
                'path': '/v1/charges',
                'headers': {
                    'authorization': `Bearer ${CONFIG.stripeAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(strPayload)
                }
            };
            //Instantiate the request object
            const req = https.request(requestDetails, async (result) => {
                // Grab the status of the sent request
                const status = result.statusCode;
                logs.log(`For ${id} charge process returned. ${status}`);
                // Callback successfully if the request went through
                if (status == 200 || status == 201) {
                    resolve(status);
                } else {
                    resolve(new PromiseError(500, `Payment failed on order with basket id: ${id}. Status returned: ${status}`));
                }
            });

            // Bind to the error event so it doesn't get thrown
            req.on('error', function (error) {
                reject(new PromiseError(`Error in payment request handler for order with basket id: ${id}.`, error));
            });
            // Add the payload
            req.write(strPayload);

            // End the request
            req.end();
        });
    }
};
