'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

/**
    * @file front end logic
*/

import { RequestObj, xhrRequest } from './ajax.js';
import { SessionObj } from './session.js';

const app = {};

// keep the session object private
const session = new SessionObj();

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
            // add the form input elements to the payload
            for (let element of this.elements) {
                if (element.type === "submit") {
                    continue;
                } // method is set erroneously if more than one form is on a page
                if (element.name === "_method") {
                    reqObj.setMethod(element.value);
                    continue;
                }
                // skip basket items without and actual order quatity
                if (element.type === 'number' && element.value === "0") {
                    continue;
                }
                reqObj.addToPayload(element.name, element.value);
            } // end for of elements

            if (formId.startsWith("order")) {
                app.fillOrderFormfromLocalStorage(reqObj);
            }

            // now after all that if the method is a DELETE method then move the payload to the querystring
            if (reqObj.getMethod() === 'DELETE') {
                reqObj.setQueryStringFromPayload();
            }
            // add the session token if it is valid
            if (session.getToken() !== false) {
                reqObj.addToHeaders('token', session.getToken());
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
                    const result = session.setSessionObj(
                        ccResObj.getResponsePayload().id,
                        ccResObj.getResponsePayload().firstName, ccResObj.getResponsePayload().phone);
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
        const result = session.setSessionObj(
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

};
app.fillOrderFormfromLocalStorage = function () {
    console.log(this);
};

app.addToBasket = function () {
    console.log(this);
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

    // Logic for basketCreateFrm settings
    if (primaryClass === 'basketCreateFrm') {
        app.loadBasketCreateFrm();
    }
};

app.loadCustomerEditFrmPage = function () {
    // Get the phone number from the current token, or log the user out if none is there
    const phone = session.getPhone();
    if (typeof (phone) === 'string' && phone.length > 0) {

        // Fetch the customer data
        const reqObj = new RequestObj();
        reqObj.setPath('customer/read')
            .setMethod('GET')
            .addToQueryString('phone', phone);
        // add the session token
        if (session.isTokenValid()) {
            reqObj.addToHeaders('token', session.getToken());
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


app.loadBasketCreateFrm = function () {
    // Get the phone number from the current token, or log the user out if none is there
    const phone = session.getPhone();
    if (typeof (phone) === 'string' && phone.length > 0) {

        // Put the hidden phone field in the form
        let hiddenPhoneInput = document.querySelector("input.hiddenPhoneNumberInput");
        hiddenPhoneInput.value = phone;
    }
    else {
        console.log(`customer logged out phone invalid: ${phone}`);
        app.logOutCustomer();
    }
};

app.bindAddToOrderButtons = function () {
    const orderButtons = document.getElementsByClassName("orderButton");
    // multiple order buttons on the basketCreateFrom
    for (let button of orderButtons) {
        button.addEventListener("click", (e) => {
            // Stop it from redirecting anywhere
            e.preventDefault();

            const groupName = button.name;
            let thisBasket = [];
            // find the correct fieldset which holds this order group and then get the collection of order choices from it
            const orderItems = document.getElementsByClassName(groupName);
            for (let order of orderItems) {

                const orderChoices = order.getElementsByClassName("orderChoices");
                if (orderChoices) {
                    for (let choice of orderChoices) {
                        const amount = choice.getElementsByClassName("choiceInput")[0].firstElementChild.value;
                        if (amount !== "0") {
                            const description = choice.getElementsByClassName("choiceDesc")[0].textContent;
                            const price = choice.getElementsByClassName("choicePrice")[0].textContent;

                            thisBasket.push(JSON.stringify({ "item": description, "amt": amount, "price": price }));
                        }
                    } // for choice of orderChoices
                } // if orderChoices
            } // for order of orderItems
            if (thisBasket.length > 0) {
                let localStorageBasket = localStorage.getItem('basket');
                localStorageBasket = (localStorageBasket !== null && localStorageBasket !== undefined)
                    ? localStorageBasket : [];
                localStorage.setItem('basket', localStorageBasket);
            }
        }); //add eventListener
    } // for button of orderButtons
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
app.logOutCustomer = function (redirectCustomer = '/sessionDeleted') {

    // Get the current token id or false if not set
    const tokenId = session.isTokenValid() ? session.getToken() : false;

    // create the request object
    const reqObj = new RequestObj();
    reqObj.setPath('token/delete')
        .setMethod('DELETE')
        .addToQueryString('id', tokenId);

    app.setLoggedInClass(session.setSessionObj(false));

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

    // Bind logout logout button
    app.bindLogoutButton();

    app.bindAddToOrderButtons();

    app.setLoggedInClass(session.initSessionFromLocalStorage());

    // Load data on page
    app.loadSavedDataOnLoggedInPages();

    // start the timer that will auto renew the token if still logged in
    app.tokenRenewalLoop();

};


// Loop to renew token every 60 minutes'ish
app.tokenRenewalLoop = function () {
    setInterval(function () {
        let result = session.renewToken();
        if (!result) {
            app.logOutCustomer();
        }
    }, 999 * 60 * 1);
};

// Call the init processes after the window loads
window.onload = () => {
    app.init();
};
