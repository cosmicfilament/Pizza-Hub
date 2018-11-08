'use strict';

/**
    * @file MailGun file for sending email updates to custom
    * @module mailGun.js
    * @description send email thru mailGun infrastructure
    * @exports send function
*/

const helpers = require('../utils/helpers');
const logs = require('../utils/logs');
const https = require('https');
const queryString = require('querystring');
const { CONFIG } = require('../lib/config');

/**
    * @summary send email
    * @description sends email status to customers
    * @param basket id
    * @param email address
    * @param message
    * @returns status
    * @throws promise reject
*/
module.exports = {
  send: async function (id, email, msg) {
    return new Promise((resolve, reject) => {
      // Configure the request payload
      const payload = {
        'from': 'john@pizzahub.com',
        'to': email,
        'subject': 'order status update',
        'text': msg
      };
      const strPayload = queryString.stringify(payload);
      // Configure the request details
      const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.mailgun.net',
        'method': 'POST',
        'path': `/V3/${CONFIG.mailGunPath}.mailgun.org`,
        'auth': `${CONFIG.mailGunAuth}`,
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(strPayload)
        }
      };
      //Instantiate the request object
      const req = https.request(requestDetails, async (result) => {
        // Grab the status of the sent request
        const status = result.statusCode;
        logs.log(`Email request returned ${status}`);
        // Callback successfully if the request went through
        if (status == 200 || status == 201) {
          resolve(status);
        }
        else {
          resolve(helpers.promiseError(500, `Customer email failed on order with basket id: ${id}. Status returned: ${status}`));
        }

      });

      // Bind to the error event so it doesn't get thrown
      req.on('error', function (e) {
        reject(` Error in email request handler for order with basket id: ${id}. Reason: ${e}`);
      });
      // Add the payload
      req.write(strPayload);

      // End the request
      req.end();
    });
  }
};
