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
const { ResponseObj, PromiseError } = require('./../utils/handlerUtils');

// file in current or target directory
const makeFName = (relativePath) => {
    return `${BASE_DIR}/${relativePath}`;
};

module.exports = {

    home: async function (reqObj) {

        // if queryString == rebuild=true then rebuild the templates cache
        if (helpers.validateObject(reqObj.queryStringObject)) {
            if (reqObj.queryStringObject['rebuild'] === 'true' && !factory.rebuildTemplates()) {
                logs.log('Shutting down app in sessionHandler home. Aborting ....', 'b');
                factory.getTheApp().shutdown(1);
            }
        }
        const body = factory.getTemplate('menu');
        // sectionBody, bodyClass, navigation, sectionTitle,  footer
        const payloadStr = factory.buildWebPage(body, 'menu');

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
                throw (new PromiseError(500, `Could not decode file type: ${fileType} for file: ${fileName}.`));
        }
        strFile = makeFName(relativePath);
        const payload = await readFileP(strFile).catch((error) => {
            throw (new PromiseError(500, `Could not read file: ${fileName}.`, error));
        });

        return resObj.setPayload(payload);
    },
    login: async function () {

        const body = factory.getTemplate('sessionCreateFrm');
        const payloadStr = factory.buildWebPage(body, 'sessionCreateFrm');

        return new ResponseObj(payloadStr, 'session/login', 'text/html');
    },
    logout: async function () {

        const body = factory.getTemplate('sessionDeleted');
        const payloadStr = factory.buildWebPage(body, 'sessionDeleted');

        return new ResponseObj(payloadStr, 'session/logout', 'text/html');
    },
    customerCreate: async function () {

        const body = factory.getTemplate('customerCreateFrm');
        const payloadStr = factory.buildWebPage(body, 'customerCreateFrm');

        return new ResponseObj(payloadStr, 'session/customerCreate', 'text/html');
    },
    customerEdit: async function () {

        const body = factory.getTemplate('customerEditFrm');
        const payloadStr = factory.buildWebPage(body, 'customerEditFrm');

        return new ResponseObj(payloadStr, 'session/customerEdit', 'text/html');
    },
    customerDeleted: async function () {

        const body = factory.getTemplate('customerDeleted');
        const payloadStr = factory.buildWebPage(body, 'customerDeleted');

        return new ResponseObj(payloadStr, 'session/customerDeleted', 'text/html');
    },
    /**
         * @summary notAllowed
         * @description  responds with 405 status code
    */
    basketCreate: async function () {

        const body = factory.getTemplate('basketCreateFrm');
        const payloadStr = factory.buildWebPage(body, 'basketCreateFrm');

        return new ResponseObj(payloadStr, 'session/basketCreate', 'text/html');
    },
    notAllowed: async function () {

        const body = factory.getTemplate('405');
        const navigation = factory.getTemplate('errorNavigation');
        const sectionTitle = '';
        const footer = factory.getTemplate('footer');
        // sectionBody, bodyClass, navigation, sectionTitle,  footer
        const payloadStr = factory.buildWebPage(body, '405', navigation, sectionTitle, footer);
        return new ResponseObj(payloadStr, 'session/notAllowed', 'text/html', '405');
    },

    /**
         * @summary notFound function
         * @description  responds with 404 status code
    */
    notFound: async function () {

        const body = factory.getTemplate('404');
        const navigation = factory.getTemplate('errorNavigation');
        const sectionTitle = '';
        const footer = factory.getTemplate('footer');
        // sectionBody, bodyClass, navigation, sectionTitle,  footer
        const payloadStr = factory.buildWebPage(body, '404', navigation, sectionTitle, footer);
        return new ResponseObj(payloadStr, 'session/notFound', 'text/html', '404');
    }
};
