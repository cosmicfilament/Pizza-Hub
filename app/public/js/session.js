'use strict';
/* eslint no-console: off */

/**
 *
 *
 *
 */

import { RequestObj, xhrRequest } from './ajax.js';

export function SessionObj() {
    this._token = false;
    this._phone = '';
    this._name = '';
}

SessionObj.prototype.setToken = function (token) {
    this._token = token;
    return this;
};
SessionObj.prototype.getToken = function () {
    return this._token;
};

SessionObj.prototype.isTokenValid = function () {
    return (this._token !== false && helpers.TYPEOF(this._token) === 'string' && this._token.length > 0) ? true : false;
};

SessionObj.prototype.setPhone = function (phone) {
    this._phone = phone;
    return this;
};
SessionObj.prototype.getPhone = function () {
    return this._phone;
};

SessionObj.prototype.setName = function (name) {
    this._name = name;
    return this;
};
SessionObj.prototype.getName = function () {
    return this._name;
};


// Get the session token from localstorage and set it in the this object
SessionObj.prototype.initSessionFromLocalStorage = function () {

    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const phone = localStorage.getItem('phone');

    // only set the session if the localStorage values
    // have previously been set. Initially or on logout
    // token is set to false;
    if (helpers.TYPEOF(token) == 'string') {
        try {
            this.setToken(JSON.parse(token))
                .setName(JSON.parse(name))
                .setPhone(JSON.parse(phone));

            return this.isTokenValid();
        } catch (e) {
            this.setToken(false)
                .setName(false)
                .setPhone(false);

            return false;
        }
    }
};

// Set the session token in the this object as well as localstorage
SessionObj.prototype.setSessionObj = function (token, name = '', phone = '') {

    console.log(`Session Token set to: ${JSON.stringify(token)}`);

    // save the session token here
    this.setToken(token)
        .setName(token === false ? false : name)
        .setPhone(token === false ? false : phone);

    // and in localStorage
    localStorage.setItem('token', JSON.stringify(this.getToken()));
    localStorage.setItem('name', JSON.stringify(this.getName()));
    localStorage.setItem('phone', JSON.stringify(this.getPhone()));

    // update the body (view)
    return this.isTokenValid();
};

// Renew the token
SessionObj.prototype.renewToken = async function () {

    if (this.isTokenValid()) {
        const reqObj = new RequestObj();
        reqObj.setPath('token/update')
            .setMethod('PUT')
            .addToPayload('id', this.getToken())
            .addToPayload('extend', true);

        // send the message to the server
        return await xhrRequest(reqObj)
            .then(
                (resObj) => { //fullfilled
                    console.log(`Renew Token: ${resObj.getResponsePayload().id}.`);
                    this.setSessionObj(
                        resObj.getResponsePayload().id,
                        resObj.getResponsePayload().firstName,
                        resObj.getResponsePayload().phone);

                    return this.isTokenValid();
                })
            .catch((error) => {
                console.log(`Token renewal error: ${error}`);
                return false;
            });
    }
};
