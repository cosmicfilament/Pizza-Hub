'use strict';

/*
*
*
*/

export function RequestObj() {
    this._path = '/';
    this._method = 'GET';
    this._payloadObj = {};
    this._queryStringObj = {};
    this._headersObj = {
        'Content-type': 'application/json'
    };
}
// path methods
RequestObj.prototype.setPath = function (path) {
    this._path = path;
    return this;
};
RequestObj.prototype.getPath = function () { return this._path; };
// method methods
RequestObj.prototype.setMethod = function (method) {
    this._method = method.toUpperCase();
    return this;
};
RequestObj.prototype.getMethod = function () { return this._method; };
// payload methods
RequestObj.prototype.addToPayload = function (key, value) {
    this._payloadObj[key] = value;
    return this;
};
RequestObj.prototype.getFromPayload = function (key) { return this._payloadObj[key]; };
RequestObj.prototype.getPayload = function () { return this._payloadObj; };
// queryString methods
RequestObj.prototype.addToQueryString = function (key, val) {
    this._queryStringObj[key] = val;
    return this;
};
RequestObj.prototype.getFromQueryString = function (key) { return this._queryStringObj[key]; };
RequestObj.prototype.getQueryString = function () { return this._queryStringObj; };
RequestObj.prototype.setQueryStringFromPayload = function () {
    this._queryStringObj = this._payloadObj;
    return this;
};
// headers methods
RequestObj.prototype.addToHeaders = function (key, val) {
    this._headersObj[key] = val;
    return this;
};
RequestObj.prototype.getFromHeaders = function (key) { return this._headersObj[key]; };
RequestObj.prototype.getHeaders = function () { return this._headersObj; };
// create Url from path and queryString
RequestObj.prototype.getUrl = function () {
    let requestUrl = this._path + '?';
    let flag = false;
    for (let key in this._queryStringObj) {
        if (this._queryStringObj.hasOwnProperty(key)) {
            // if atleast 1 querystring has been added, prepend new ones with ampersand
            flag ? requestUrl += '&' : flag = true;
        }
        // add the key and value
        requestUrl += key + '=' + this._queryStringObj[key];
    }
    return (flag === true) ? requestUrl : this._path;
};

export function ResponseObj(status = 200, statusText = '', resPayload = '') {
    this._status = status;
    this._statusText = statusText;
    this._responsePayload = resPayload;
}
ResponseObj.prototype.getStatus = function () { return this._status; };
ResponseObj.prototype.getStatusText = function () { return this._statusText; };
ResponseObj.prototype.getResponsePayload = function () { return this._responsePayload; };


// AJAX request method
export function xhrRequest(reqObj) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(reqObj.getMethod(), reqObj.getUrl());
        //add the headers to the request
        let headers = reqObj.getHeaders();
        if (headers) {
            for (let header in headers) {
                xhr.setRequestHeader(header, headers[header]);
            }
        }
        // set the callback
        xhr.onload = () => {
            // check for valid response code and not a redirect
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(new ResponseObj(
                    xhr.status, xhr.statusText,
                    JSON.parse(xhr.responseText))
                );
            }
            else {
                reject(new ResponseObj(
                    xhr.status, xhr.statusText,
                    JSON.parse(xhr.responseText))
                );
            }
        };
        xhr.onerror = () => reject(new ResponseObj(
            xhr.status, xhr.statusText,
            JSON.parse(xhr.responseText))
        );
        const payloadStr = JSON.stringify(reqObj.getPayload());
        xhr.send(payloadStr);
    });
}
