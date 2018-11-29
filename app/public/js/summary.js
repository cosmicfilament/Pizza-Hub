'use strict';
/* eslint quotes: off */
/* eslint no-console: off */

import { RequestObj, xhrRequest } from './ajax.js';

export function summary() { }

summary.bindDeleteButtons = function (app) {

    const buttons = document.querySelectorAll("input[type='button']");
    for (let button of buttons) {

        button.addEventListener("click", (e) => {

            e.preventDefault();

            let parentNode = button.parentElement.parentElement;
            if (!parentNode) {
                helpers.log('red', `Unable to retrieve the parentNode in bindDeleteButtons for: ${button.name}.`);
                document.querySelector("#" + "orderSummaryFrm" + " .formError").innerHTML = "Error deleting the item from the basket.";
                document.querySelector("#" + "orderSummaryFrm" + " .formError").style.display = 'block';
                return;
            }
            const children = parentNode.getElementsByClassName("orderItemId");
            const itemId = children[0].name;

            if (!itemId) {
                helpers.log('red', `Unable to retrieve the itemId in bindDeleteButtons for: ${button.name}.`);
                document.querySelector("#" + "orderSummaryFrm" + " .formError").innerHTML = "Error deleting the item from the basket.";
                document.querySelector("#" + "orderSummaryFrm" + " .formError").style.display = 'block';
                return;
            }

            const reqObj = new RequestObj();
            const basketId = localStorage.getItem('savedBasketId');

            reqObj.setPath('/summary/delete')
                .setMethod('DELETE')
                .addToQueryString('basketId', basketId)
                .addToPayload('choiceId', button.name)
                .addToPayload('itemId', itemId);

            // add the session token
            if (app.session.isTokenValid()) {
                reqObj.addToHeaders('token', app.session.getToken());
            }
            // send the message to the server
            xhrRequest(reqObj)
                .then(
                    (resObj) => { //fullfilled
                        const msg = resObj.getResponsePayload();
                        console.log(msg);
                        const result = Number(resObj.getResponsePayload());
                        if (result === 0) {
                            localStorage.setItem('savedBasketId', '');
                        }
                        summary.gotoSummaryFrm();

                    })
                .catch((error) => {
                    console.log(error);
                    document.querySelector("#" + "orderSummaryFrm" + " .formError").innerHTML = error;
                    document.querySelector("#" + "orderSummaryFrm" + " .formError").style.display = 'block';
                });

        });

    }
};

summary.bindOrderSummaryButton = function () {

    document.getElementById("orderSummaryButton").addEventListener("click", (e) => {

        // Stop it from redirecting anywhere
        e.preventDefault();
        summary.gotoSummaryFrm();
    });
};

summary.gotoSummaryFrm = function () {
    let baseUrl = `${window.location.protocol}//${window.location.host}`;
    window.location.href = `${baseUrl}/orderSummaryFrm?basketId=${localStorage.getItem('savedBasketId')}`;
};

// summary.loadOrderSummaryFrmPage = function (app) {

//     // Fetch the orderSummary form populated with the current basket data
//     const reqObj = new RequestObj();
//     const basketId = localStorage.getItem('savedBasketId');

//     reqObj.setPath('/summary/read')
//         .setMethod('GET')
//         .addToQueryString('id', basketId)
//         .responseType = 'document';
//     // add the session token
//     if (app.session.isTokenValid()) {
//         reqObj.addToHeaders('token', app.session.getToken());
//     }
//     // send the message to the server
//     xhrRequest(reqObj)
//         .then(
//             (resObj) => { //fullfilled
//                 console.log(`Read Summary Content Response successful: ${JSON.stringify(resObj)}`);
//                 const input = document.querySelector(".orderSummaryFrmBasketId");
//                 input.name = basketId;
//                 const wrapper = document.querySelector(".orderSummaryWrapper");
//                 wrapper.innerHTML = resObj.getResponsePayload();
//                 // force a reflow
//                 input.scrollTop();
//             })
//         .catch((error) => {
//             console.log(error);
//             document.querySelector("#" + "orderSummaryFrm" + " .formError").innerHTML = error;
//             document.querySelector("#" + "orderSummaryFrm" + " .formError").style.display = 'block';
//         });
// };
