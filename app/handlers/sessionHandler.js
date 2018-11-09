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
const { ResponseObj } = require('./../utils/handlerUtils');

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

        return new ResponseObj(payloadStr, 'session/home', 'text/html');
    },

    public: async function (reqObj) {

        const resObj = new ResponseObj();
        resObj.setSender('session/public');

        // what the request wants is a file (fileName) in a subdirectory (subDir).
        let strToFind = new RegExp(/^public\/(img|js|css)\/(.+)/);
        let [relativePath, strFile, fileName, fileType] = reqObj.trimmedPath.match(strToFind);
        [strFile, fileType] = fileName.split('.');

        switch (fileType) {
            case 'css':
                resObj.setSender('session/public/css');
                resObj.setContentType('text/css');
                break;
            case 'js':
                resObj.setSender('session/public/js');
                resObj.setContentType('text/javascript');
                break;
            case 'jpg':
            case 'jpeg':
                resObj.setSender('session/public/jpg');
                resObj.setContentType('image/jpeg');
                break;
            case 'png':
                resObj.setSender('session/public/png');
                resObj.setContentType('image/png');
                break;
            case 'gif':
                resObj.setSender('session/public/gif');
                resObj.setContentType('image/gif');
                break;
            case 'ico':
                resObj.setSender('session/public/ico');
                resObj.setContentType('image/x-icon');
                break;
            default:
                throw (helpers.promiseError(500, `Could not decode file type: ${fileType} for file: ${fileName}.`));
        }
        strFile = makeFName(relativePath);
        const payload = await readFileP(strFile).catch((error) => {
            throw (helpers.promiseError(500, `Could not read file: ${fileName}. Reason: ${error.message}`));
        });

        return resObj.setPayload(payload);
    },
    login: async function () {
        const body = factory.getTemplate('sessionCreateFrm');
        const payloadStr = factory.addBodyToLayout('sessionCreateFrm', body);

        return new ResponseObj(payloadStr, 'session/login', 'text/html');
    },
    logout: async function () {
        const body = factory.getTemplate('sessionDeleted');
        const payloadStr = factory.addBodyToLayout('sessionDeleted', body);

        return new ResponseObj(payloadStr, 'session/logout', 'text/html');
    },
    customerCreate: async function () {

        const body = factory.getTemplate('customerCreateFrm');
        const payloadStr = factory.addBodyToLayout('customerCreateFrm', body);

        return new ResponseObj(payloadStr, 'session/customerCreate', 'text/html');
    },
    customerEdit: async function () {

        const body = factory.getTemplate('customerEditFrm');
        const payloadStr = factory.addBodyToLayout('customerEditFrm', body);

        return new ResponseObj(payloadStr, 'session/customerEdit', 'text/html');
    },
    customerDeleted: async function () {

        const body = factory.getTemplate('customerDeleted');
        const payloadStr = factory.addBodyToLayout('customerDeleted', body);

        return new ResponseObj(payloadStr, 'session/customerDeleted', 'text/html');
    },
    /**
         * @summary notAllowed
         * @description  responds with 405 status code
    */
    notAllowed: async function () {
        const payloadStr = JSON.stringify({ 'name': '405 - Not Allowed.' });
        return new ResponseObj(payloadStr, 'session/notAllowed', 'application/json', '405');
    },

    /**
         * @summary notFound function
         * @description  responds with 404 status code
    */
    notFound: async function () {
        const payloadStr = JSON.stringify({ 'name': '404 - Not Allowed.' });
        return new ResponseObj(payloadStr, 'session/notFound', 'application/json', '404');
    }
};
