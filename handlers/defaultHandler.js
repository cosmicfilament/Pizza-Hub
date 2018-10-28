'use strict';

/**
    * @file defaultHandler file that handles 404 and 405 errors
    * @module defaultHandler.js
    * @description  error handler functions
*/

module.exports = {

    /**
         * @summary notAllowed
         * @description  responds with 405 status code
    */
    notAllowed: () => {
        const resObj = {
            'content_type': 'application/json',
            'statusCode': '405',
            'payload': JSON.stringify({ 'name': '405 - Not Allowed.' })
        };
        return Promise.resolve(resObj);
    },

    /**
         * @summary notFound function
         * @description  responds with 404 status code
    */
    notFound: () => {
        const resObj = {
            'content_type': 'application/json',
            'statusCode': '404',
            'payload': JSON.stringify({ 'name': '404 - Not Found.' })
        };
        return Promise.resolve(resObj);
    }
};
