'use strict';

/**
    * @file sessionHandler file that handles 404 and 405 errors
    * @module sessionHandler.js
    * @description  error handler functions
*/

const factory = require('../lib/templates/templateFactory');
const readFileP = require('util').promisify(require('fs').readFile);
const helpers = require('../utils/helpers');
const logs = require('../utils/logs');
const { BASE_DIR } = require('../lib/config');

// file in current or target directory
const makeFName = (relativePath) => {
    return `${BASE_DIR}/${relativePath}`;
};

module.exports = {

    home: async function (reqObj) {
        // if queryString == rebuild then rebuild the templates cache
        if (helpers.validateObject(reqObj.queryStringObject)) {
            if (reqObj.queryStringObject['rebuild'] === 'true' && !factory.rebuildTemplates()) {
                logs.log('Shutting down app in sessionHandler home. Aborting ....', 'b');
                factory.getTheApp().shutdown(1);
            }

        }

        const body = factory.getTemplate('menu');
        const payloadStr = factory.addBodyToLayout('menu', body);

        const resObj = {
            'content_type': 'text/html',
            'statusCode': '200',
            'payload': payloadStr
        };
        return Promise.resolve(resObj);
    },

    public: async function (reqObj) {

        const resObj = {
            'content_type': '',
            'statusCode': '200',
            'payload': ''
        };

        // what the request wants is a file (fileName) in a subdirectory (subDir).
        let strToFind = new RegExp(/^public\/(img|js|css)\/(.+)/);
        let [relativePath, strFile, fileName, fileType] = reqObj.trimmedPath.match(strToFind);
        [strFile, fileType] = fileName.split('.');

        switch (fileType) {
            case 'css':
                resObj.content_type = 'text/css';
                break;
            case 'js':
                resObj.content_type = 'text/javascript';
                break;
            case 'jpg':
            case 'jpeg':
                resObj.content_type = 'image/jpeg';
                break;
            case 'png':
                resObj.content_type = 'image/png';
                break;
            case 'gif':
                resObj.content_type = 'image/gif';
                break;
            case 'ico':
                resObj.content_type = 'image/x-icon';
                break;
            // case 'html':
            //   resObj.content_type = 'text/html';
            //   break;
            default:
                throw (helpers.promiseError(500, `Could not decode file type: ${fileType} for file: ${fileName}.`));
        }
        strFile = makeFName(relativePath);
        resObj.payload = await readFileP(strFile).catch((error) => {
            throw (helpers.promiseError(500, `Could not read file: ${fileName}. Reason: ${error.message}`));
        });
        return Promise.resolve(resObj);
    },
    login: () => {
        const body = factory.getTemplate('sessionCreateFrm');
        const payloadStr = factory.addBodyToLayout('sessionCreateFrm', body);

        const resObj = {
            'content_type': 'text/html',
            'statusCode': '200',
            'payload': payloadStr
        };
        return Promise.resolve(resObj);
    },
    logout: () => {
        const body = factory.getTemplate('sessionDeleted');
        const payloadStr = factory.addBodyToLayout('sessionDeleted', body);

        const resObj = {
            'content_type': 'text/html',
            'statusCode': '200',
            'payload': payloadStr
        };
        return Promise.resolve(resObj);
    },
    customerCreate: () => {

        const body = factory.getTemplate('customerCreateFrm');
        const payloadStr = factory.addBodyToLayout('customerCreateFrm', body);

        const resObj = {
            'content_type': 'text/html',
            'statusCode': '200',
            'payload': payloadStr
        };
        return Promise.resolve(resObj);
    },
    customerEdit: () => {

        const body = factory.getTemplate('customerEditFrm');
        const payloadStr = factory.addBodyToLayout('customerEditFrm', body);

        const resObj = {
            'content_type': 'text/html',
            'statusCode': '200',
            'payload': payloadStr
        };
        return Promise.resolve(resObj);
    },
    customerDeleted: () => {

        const body = factory.getTemplate('customerDeleted');
        const payloadStr = factory.addBodyToLayout('customerDeleted', body);

        const resObj = {
            'content_type': 'text/html',
            'statusCode': '200',
            'payload': payloadStr
        };
        return Promise.resolve(resObj);
    },
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
