'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

/**
    * @file front end logic
*/

import { RequestObj, xhrRequest } from './ajax.js';
import { SessionObj } from './session.js';
import { updateOrderCreateFrm, bindAddToBasketButtons } from './orders.js';
import { displayOrderSummary } from './orderSummary.js';

const app = {};

// keep the session object private
app.session = new SessionObj();

// bind the forms to the xhrRequest method via the eventlistener
app.bindForms = function () {

    if (!document.querySelector("form")) {
        return;
    }
    const forms = document.querySelectorAll("form");
    for (let form of forms) {

        // and add an eventlistener to their submit button, binding it to this function
        form.addEventListener("submit", function (e) {

            e.preventDefault();

            const formId = this.id;
            if (formId.startsWith('orderCreate')) {

                const basketTotalQty = app.session.getBasketTotalQuantity();
                if (basketTotalQty === 0) {
                    return;
                }
            }
            // hide the error message and/or success message if shown
            let frmError = document.querySelector("#" + formId + " .formError");
            let frmSuccess = document.querySelector("#" + formId + " .formSuccess");

            if (frmError) frmError.style.display = 'none';
            if (frmSuccess) frmSuccess.style.display = 'none';

            // create a request object and populate it from the form data
            const reqObj = new RequestObj();
            // add the request method
            reqObj.setPath(this.action)
                .setMethod(this.method.toUpperCase());

            if (formId.startsWith("order")) {
                reqObj.addToPayload('basket', app.session.getBasket());
                reqObj.addToPayload('phone', app.session.getPhone());
                reqObj.addToPayload('basketTotal', app.session.getFormattedBasketTotal());
            }
            else {
                // add the form input elements to the payload
                for (let element of this.elements) {
                    if (element.type === "submit") {
                        continue;
                    } // method is set erroneously if more than one form is on a page
                    if (element.name === "_method") {
                        reqObj.setMethod(element.value);
                        continue;
                    }
                    reqObj.addToPayload(element.name, element.value);
                } // end for of elements
            }


            // now after all that if the method is a DELETE method then move the payload to the querystring
            if (reqObj.getMethod() === 'DELETE') {
                reqObj.setQueryStringFromPayload();
            }
            // add the session token if it is valid
            if (app.session.getToken() !== false) {
                reqObj.addToHeaders('token', app.session.getToken());
            }
            // send the message to the server
            xhrRequest(reqObj)
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

// called on successful completion of xhr request that was bound to a submit button
app.formResponseProcessor = function (formId, previousReqObj, resObj) {

    /**********   Customer Create Response   **********/
    if (formId === 'customerCreateFrm') {
        // automatically log him in using the data from the previousReqObj
        const reqObj = new RequestObj();
        // build the request object parameters
        reqObj.setPath('token/create')
            .setMethod('POST')
            .addToPayload('phone', previousReqObj.getFromPayload('phone'))
            .addToPayload('password', previousReqObj.getFromPayload('password'));
        // send the message to the server
        xhrRequest(reqObj)
            .then(
                (ccResObj) => { //fullfilled
                    console.log(`Response successful: ${JSON.stringify(ccResObj)}`);
                    // save the new session token
                    const result = app.session.setSessionObj(
                        ccResObj.getResponsePayload().id,
                        ccResObj.getResponsePayload().firstName,
                        ccResObj.getResponsePayload().phone);
                    app.setLoggedInClass(result);
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

    /**********   Session Create Response   **********/
    if (formId === 'sessionCreateFrm') {
        // save the new session token
        const result = app.session.setSessionObj(
            resObj.getResponsePayload().id,
            resObj.getResponsePayload().firstName,
            resObj.getResponsePayload().phone);
        app.setLoggedInClass(result);
        window.location = 'home';
    }

    /**********    Customer Edit Response   **********/
    const customerForms = ['customerEditFrm_1', 'customerEditFrm_2'];
    if (customerForms.indexOf(formId) > -1) {
        document.querySelector("#" + formId + " .formSuccess").style.display = 'block';
    }

    if (formId == 'customerEditFrm_3') {
        // instead of redirect
        app.logOutCustomer('/customerDeleted');
    }

    /**********    Basket(Order) Create Response   **********/
    if (formId.startsWith('orderCreate')) {
        app.session.clearSessionBasket();
        updateOrderCreateFrm(app, true);
        window.location = "orderSummary";
    }

};


// Load data on the page
app.loadSavedDataOnLoggedInPages = function () {
    // Get the current page from the body class
    var bodyClasses = document.querySelector("body").classList;
    var primaryClass = typeof (bodyClasses[0]) === 'string' ? bodyClasses[0] : false;

    // Logic for customerEditFrm settings
    if (primaryClass === 'customerEditFrm') {
        app.loadCustomerEditFrmPage();
    }

    // Logic for orderCreateFrom settings
    if (primaryClass === 'orderCreateFrm') {
        updateOrderCreateFrm(app);
    }
    if (primaryClass === 'orderSummary') {
        if (app.session.getPreviousOrder().prevTotalQuantity > 0) {
            displayOrderSummary(app);
        }
    }
};

app.loadCustomerEditFrmPage = function () {
    // Get the phone number from the current token, or log the user out if none is there
    const phone = app.session.getPhone();
    if (typeof (phone) === 'string' && phone.length > 0) {

        // Fetch the customer data
        const reqObj = new RequestObj();
        reqObj.setPath('customer/read')
            .setMethod('GET')
            .addToQueryString('phone', phone);
        // add the session token
        if (app.session.isTokenValid()) {
            reqObj.addToHeaders('token', app.session.getToken());
        }
        // send the message to the server
        xhrRequest(reqObj)
            .then(
                (resObj) => { //fullfilled
                    console.log(`Response successful: ${JSON.stringify(resObj)}`);
                    // Put the data into the forms as values where needed
                    document.querySelector("#customerEditFrm_1 .firstNameInput").value = resObj.getResponsePayload().firstName;
                    document.querySelector("#customerEditFrm_1 .lastNameInput").value = resObj.getResponsePayload().lastName;
                    document.querySelector("#customerEditFrm_1 .displayPhoneInput").value = resObj.getResponsePayload().phone;
                    document.querySelector("#customerEditFrm_1 .addressInput").value = resObj.getResponsePayload().address;
                    document.querySelector("#customerEditFrm_1 .emailInput").value = resObj.getResponsePayload().email;

                    // Put the hidden phone field into both forms
                    let hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
                    for (let i = 0; i < hiddenPhoneInputs.length; i++) {
                        hiddenPhoneInputs[i].value = resObj.getResponsePayload().phone;
                    }
                })
            .catch((error) => {
                console.log(`Response error: ${error}`);
                // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                app.logOutCustomer();
            });
    }
    else {
        console.log(`customer logged out phone invalid: ${phone}`);
        app.logOutCustomer();
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

app.bindOrderSummaryButton = function () {

    document.getElementById("orderSummaryButton").addEventListener("click", (e) => {

        // Stop it from redirecting anywhere
        e.preventDefault();

        const basketTotalQty = app.session.getBasketTotalQuantity();
        const prevBasketTotalQty = app.session.getPreviousOrder().prevTotalQuantity;

        if (prevBasketTotalQty === 0) {
            if (basketTotalQty > 0) {
                app.session.clearSessionBasket();
                return app.sendOrderToServer()
                    .then((result) => {
                        if (result) {
                            window.location = "orderSummary";
                            return true;
                        }
                        return false;
                    })
                    .catch((error) => { // bigassed error
                        console.log(error);
                        return false;
                    });
            }
            else {
                window.location = "orderSummary";
            }
        }
    });
};

app.sendOrderToServer = function () {

    // create a request object and populate it
    const reqObj = new RequestObj();
    // add the request method
    reqObj.setPath('./basket/create')
        .setMethod('POST')
        .addToPayload('basket', app.session.getBasket())
        .addToPayload('phone', app.session.getPhone())
        .addToPayload('basketTotal', app.session.getFormattedBasketTotal())
        .addToHeaders('token', app.session.getToken());

    // send the message to the server
    return xhrRequest(reqObj)
        .then(
            (resObj) => { //fullfilled
                console.log(`Request successful: ${JSON.stringify(resObj)}`);
                return true;
            })
        .catch((error) => {
            console.log(error);
            return false;
        });
};

// Log the customer out then redirect them to the deleted page if true
app.logOutCustomer = function (redirectCustomer = '/sessionDeleted') {

    // Get the current token id or false if not set
    const tokenId = app.session.isTokenValid() ? app.session.getToken() : false;

    // create the request object
    const reqObj = new RequestObj();
    reqObj.setPath('token/delete')
        .setMethod('DELETE')
        .addToQueryString('id', tokenId);

    app.setLoggedInClass(app.session.setSessionObj(false));

    // send the message to the server
    xhrRequest(reqObj)
        .then(
            (resObj) => { //fullfilled
                console.log(`Logout successful: ${JSON.stringify(resObj)}`);
                window.location = redirectCustomer;
            })
        .catch((error) => { console.log(`Logout error: ${error}`); });
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {

    const target = document.querySelector("body");
    //const firstName = app.config.firstName;

    if (add) {
        target.classList.add('loggedIn');
    }
    else {
        target.classList.remove('loggedIn');
    }
};

// Init (bootstrapping)
app.init = () => {

    // Bind all form submissions
    app.bindForms();

    // Bind menu buttons button
    app.bindLogoutButton();

    bindAddToBasketButtons(app);

    app.bindOrderSummaryButton();

    app.setLoggedInClass(app.session.initSessionFromLocalStorage());

    // Load data on page
    app.loadSavedDataOnLoggedInPages();

    // start the timer that will auto renew the token if still logged in
    app.tokenRenewalLoop();

};


// Loop to renew token every 60 minutes'ish
app.tokenRenewalLoop = function () {
    setInterval(function () {
        let result = app.session.renewToken();
        if (!result) {
            app.logOutCustomer();
        }
    }, 999 * 60 * 60);
};

// Call the init processes after the window loads
window.onload = () => {
    app.init();
};
