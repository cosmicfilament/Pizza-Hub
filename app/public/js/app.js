'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

/**
    * @file front end logic
*/

const app = {};

app.config = {
    'sessionToken': false,
    'firstName': ''
};

app.RequestObj = function () {
    this._path = '/';
    this._method = 'GET';
    this._payloadObj = {};
    this._queryStringObj = {};
    this._headersObj = {
        'Content-type': 'application/json',
        'token': -1
    };
    this.getUrl = function () {
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
        return flag ? requestUrl : this._path;
    };
};
// path methods
app.RequestObj.prototype.setPath = function (path) {
    this._path = path;
    return this;
};
app.RequestObj.prototype.getPath = function () { return this._path; };
// method methods
app.RequestObj.prototype.setMethod = function (method) {
    this._method = method.toUpperCase();
    return this;
};
app.RequestObj.prototype.getMethod = function () { return this._method; };
// payload methods
app.RequestObj.prototype.addToPayload = function (key, value) {
    this._payloadObj[key] = value;
    return this;
};
app.RequestObj.prototype.getFromPayload = function (key) { return this._payloadObj[key]; };
app.RequestObj.prototype.getPayload = function () { return this._payloadObj; };
// queryString methods
app.RequestObj.prototype.addToQueryString = function (key, val) {
    this._queryStringObj[key] = val;
    return this;
};
app.RequestObj.prototype.getFromQueryString = function (key) { return this._queryStringObj[key]; };
app.RequestObj.prototype.getQueryString = function () { return this._queryStringObj; };
app.RequestObj.prototype.setQueryStringFromPayload = function () {
    this._queryStringObj = this._payloadObj;
    return this;
};
// headers methods
app.RequestObj.prototype.addToHeaders = function (key, val) {
    this._headersObj[key] = val;
    return this;
};
app.RequestObj.prototype.getFromHeaders = function (key) { return this._headersObj[key]; };
app.RequestObj.prototype.getHeaders = function () { return this._headersObj; };
// create Url from path and queryString

app.ResponseObj = function (status = 200, statusText = '', resPayload = '') {
    this._status = status;
    this._statusText = statusText;
    this._responsePayload = resPayload;
};
app.ResponseObj.prototype.getStatus = function () { return this._status; };
app.ResponseObj.prototype.getStatusText = function () { return this._statusText; };
app.ResponseObj.prototype.getResponsePayload = function () { return this._responsePayload; };

// AJAX request method
app.xhrRequest = (reqObj) => {
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
        // If there is a current session token set, add that as a header
        if (app.config.sessionToken) {
            xhr.setRequestHeader("token", app.config.sessionToken);
        }
        // set the callback
        xhr.onload = () => {
            // check for valid response code and not a redirect
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(new app.ResponseObj(
                    xhr.status, xhr.statusText,
                    JSON.parse(xhr.responseText))
                );
            }
            else {
                reject(new app.ResponseObj(
                    xhr.status, xhr.statusText,
                    JSON.parse(xhr.responseText))
                );
            }
        };
        xhr.onerror = () => reject(new app.ResponseObj(
            xhr.status, xhr.statusText,
            JSON.parse(xhr.responseText))
        );
        const payloadStr = JSON.stringify(reqObj.getPayload());
        xhr.send(payloadStr);
    });
};

// bind the forms to the xhrRequest method via the eventlistener
app.bindForms = () => {

    if (!document.querySelector("form")) {
        return;
    }
    const forms = document.querySelectorAll("form");
    for (let form of forms) {
        // and add an eventlistener to their submit button, binding it to this function
        form.addEventListener("submit", function (e) {

            e.preventDefault();

            const formId = this.id;
            // hide the error message and/or success message if shown
            let frmError = document.querySelector("#" + formId + " .formError");
            let frmSuccess = document.querySelector("#" + formId + " .formSuccess");

            if (frmError) frmError.style.display = 'none';
            if (frmSuccess) frmSuccess.style.display = 'none';
            // create a request object and populate it from the form data
            const reqObj = new app.RequestObj();
            reqObj.setPath(this.action)
                .setMethod(this.method.toUpperCase());
            // form input elements
            for (let element of this.elements) {
                if (element.type === "submit") continue;
                reqObj.addToPayload(element.name, element.value);
            } // end for of elements

            // send the message to the server
            app.xhrRequest(reqObj)
                .then(
                    (resObj) => { //fullfilled
                        console.log(`Request successful: ${JSON.stringify(resObj)}`);
                        app.formResponseProcessor(formId, reqObj, resObj);
                    },
                    (resObj) => { // rejected
                        if (resObj.status === 403) {
                            console.log(`Request rejected due to 403 error: ${JSON.stringify(resObj)}`);
                            app.logOutCustomer();
                        }
                        else { // rejected due to error
                            console.log(`Request rejected: ${JSON.stringify(resObj)}`);
                            // Set the formError field with the error text and then unhide it
                            document.querySelector("#" + formId + " .formError").innerHTML = resObj.getResponsePayload();
                            document.querySelector("#" + formId + " .formError").style.display = 'block';
                        }
                    })
                .catch((error) => { // bigassed error
                    console.log(error);
                    document.querySelector("#" + formId + " .formError").innerHTML = error;
                    document.querySelector("#" + formId + " .formError").style.display = 'block';
                });
        }); // end addeventListener
    } // end for of forms
};

// called on successful completion of xhr request
app.formResponseProcessor = (formId, previousReqObj, resObj) => {

    /**********   Customer Create Response   **********/
    if (formId === 'customerCreateFrm') {
        // automatically log him in using the data from the previousReqObj
        const reqObj = new app.RequestObj();
        reqObj.setPath('token/create')
            .setMethod('POST')
            .addToPayload('phone', previousReqObj.getFromPayload('phone'))
            .addToPayload('password', previousReqObj.getFromPayload('password'));
        // send the message to the server
        app.xhrRequest(reqObj)
            .then(
                (ccResObj) => { //fullfilled
                    console.log(`Response successful: ${JSON.stringify(ccResObj)}`);
                    // should be a new token sending complete token object from the
                    // server in case we want to do something with it later
                    app.setSessionToken(ccResObj.getResponsePayload().id, ccResObj.getResponsePayload().firstName);
                    window.location = 'home';
                })
            .catch((error) => {
                console.log(`Response error: ${error}`);

                // Set the formError field with the error text
                document.querySelector("#" + formId + " .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

                // Show (unhide) the form error field on the form
                document.querySelector("#" + formId + " .formError").style.display = 'block';
            });
    }
    /**********   End Customer Create Response  **********/

    /**********   Session Create Response   **********/
    if (formId === 'sessionCreateFrm') {
        app.setSessionToken(resObj.getResponsePayload().id, resObj.getResponsePayload().firstName);
        window.location = 'home';
    }
    /**********   End Session Create Response  **********/
};

// Renew the token
app.renewToken = () => {

    const currentToken = typeof (app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
    if (currentToken) {
        const reqObj = new app.RequestObj();
        reqObj.setPath('token/update')
            .setMethod('PUT')
            .addToPayload('id', currentToken)
            .addToPayload('extend', true);

        // send the message to the server
        return app.xhrRequest(reqObj)
            .then(
                (resObj) => { //fullfilled
                    app.setSessionToken(resObj.getResponsePayload().id, resObj.getResponsePayload().firstName);
                })
            .catch((error) => { console.log(`Token renewal error: ${error}`); });
    }

};

// Bind the logout button
app.bindLogoutButton = function () {
    document.getElementById("logoutButton").addEventListener("click", (e) => {

        // Stop it from redirecting anywhere
        e.preventDefault();
        // Log the customer out
        app.logOutCustomer();

    });
};

// Log the customer out then redirect them to the deleted page if true
app.logOutCustomer = function (redirectCustomer = true) {

    // Get the current token id or false if not set
    const tokenId = typeof (app.config.sessionToken) === 'string' ? app.config.sessionToken : false;

    // create the request object
    const reqObj = new app.RequestObj();
    reqObj.setPath('token/delete')
        .setMethod('DELETE')
        .addToQueryString('id', tokenId);

    app.setSessionToken(false);

    // send the message to the server
    app.xhrRequest(reqObj)
        .then(
            (resObj) => { //fullfilled
                console.log(`Logout successful: ${JSON.stringify(resObj)}`);
                if (redirectCustomer) window.location = '/sessionDeleted';
            })
        .catch((error) => { console.log(`Logout error: ${error}`); });
};


// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {

    const tokenString = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName');

    if (typeof (tokenString) == 'string') {
        try {

            app.config.sessionToken = JSON.parse(tokenString);
            app.config.firstName = JSON.parse(firstName);

            if (app.config.sessionToken === false) {
                app.setLoggedInClass(false);
            }
            else {
                app.setLoggedInClass(true);
            }
        }
        catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {

    const target = document.querySelector("body");
    const greeting = document.querySelector(".greeting");
    const firstName = app.config.firstName;

    if (add) {
        target.classList.add('loggedIn');
        greeting.innerHTML = `Hello ${firstName}. Welcome Back!`;
    }
    else {
        target.classList.remove('loggedIn');
        greeting.innerHTML = '';
    }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = (token, firstName = '') => {

    console.log(`Session Token set to: ${JSON.stringify(token)}`);

    // save the session token here
    app.config.sessionToken = token;
    app.config.firstName = firstName;

    // and in localStorage
    localStorage.setItem('token', JSON.stringify(token));
    localStorage.setItem('firstName', JSON.stringify(firstName));
    // update the body (view)
    app.setLoggedInClass((token === false) ? false : true);
};

// Load data on the page
app.loadDataOnPage = function () {
    // Get the current page from the body class
    var bodyClasses = document.querySelector("body").classList;
    var primaryClass = typeof (bodyClasses[0]) === 'string' ? bodyClasses[0] : false;

    // // Logic for account settings page
    // if (primaryClass == 'accountEdit') {
    //     app.loadAccountEditPage();
    // }

    // // Logic for dashboard page
    // if (primaryClass == 'checksList') {
    //     app.loadChecksListPage();
    // }

    // // Logic for check details page
    // if (primaryClass == 'checksEdit') {
    //     app.loadChecksEditPage();
    // }
};

// Init (bootstrapping)
app.init = () => {

    // Bind all form submissions
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // Get the token from localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();

    // Load data on page
    app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = () => {
    app.init();
};

// Loop to renew token often
app.tokenRenewalLoop = function () {
    setInterval(function () {
        return app.renewToken();
    }, 1000 * 60 * 59);
};
