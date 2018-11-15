'use strict';

/**
* @file router module decodes the route and sends a function handle back to the server that will be used to process the request
* @module router.js
* @description process the path in the request object and passes back a handle to the request handler function
*/

// defaultault routes that were used in testing and also any error handler such as 404 error
const sessionHandler = require('../handlers/sessionHandler');
const customerHandler = require('./../handlers/customerHandler');
const tokenHandler = require('./../handlers/tokenHandler');
const basketHandler = require('./../handlers/basketHandler');

/**
 * @summary Message router object
 * @description Routes requests messages to the specific handler requested in the path
 * @param the route method takes a method and trimmed path string
 * @returns a handle to a function that will handle the request
*/
const Router = function () {
    // private object that maps the trimmed path value to a handler function
    const routes = {
        // loads index.html which has the menu, login and customer create
        'home': { 'method': 'get', 'route': sessionHandler.home },
        // loads the css, js, images and favicon
        'public': { 'method': 'get', 'route': sessionHandler.public },
        // loads the customerCreate web page from index.html
        'customercreatefrm': { 'method': 'get', 'route': sessionHandler.customerCreate },
        // loads the customerDeleted web page after the customer deletes his account
        'customerdeleted': { 'method': 'get', 'route': sessionHandler.customerDeleted },
        // loads the customerEditFrm web page
        'customereditfrm': { 'method': 'get', 'route': sessionHandler.customerEdit },
        // loads the sessionCreate web page from index.html
        'sessioncreatefrm': { 'method': 'get', 'route': sessionHandler.login },
        // loads the sessionDeleted web page after the customer logs out
        'sessiondeleted': { 'method': 'get', 'route': sessionHandler.logout },
        // loads the basketCreateFrm html web page
        'basketcreatefrm': { 'method': 'get', 'route': sessionHandler.basketCreate },
        // ajax call to delete the customer record
        'customer/delete': { 'method': 'delete', 'route': customerHandler.delete },
        // ajax call to delete the token for a customer that is logging out
        'token/delete': { 'method': 'delete', 'route': tokenHandler.delete },
        // ajax call generated from customerCreate web page tells the server to create a new customer
        'customer/create': { 'method': 'post', 'route': customerHandler.create },
        // ajax call generated from customerCreate or sessionCreate (login). creates a session token
        'token/create': { 'method': 'post', 'route': tokenHandler.create },
        // ajax call generated from the customerEditFrm
        'customer/update': { 'method': 'put', 'route': customerHandler.update },
        // ajax call generated from app.js during a customer update
        'customer/read': { 'method': 'get', 'route': customerHandler.read },
        // 404
        'notFound': { 'method': 'any', 'route': sessionHandler.notFound },
        // 405
        'notAllowed': { 'method': 'any', 'route': sessionHandler.notAllowed },
        //********************************************************************** */

        'token/read': { 'method': 'get', 'route': tokenHandler.read },
        'token/update': { 'method': 'put', 'route': tokenHandler.update },
        'basket/menu': { 'method': 'get', 'route': basketHandler.menu },
        'basket/checkout': { 'method': 'post', 'route': basketHandler.checkOut },
        'basket/create': { 'method': 'post', 'route': basketHandler.create },
        'basket/read': { 'method': 'get', 'route': basketHandler.read },
        'basket/update': { 'method': 'put', 'route': basketHandler.update },
        'basket/delete': { 'method': 'delete', 'route': basketHandler.delete }
    };

    // public method on the Router object that returns the decoded handler function
    return {
        route: function (method, path) {
            // allows any mix of upper and lower case value from client app.
            path = path.toLowerCase();
            method = method.toLowerCase();

            // test for path pointing to public directory "public/"
            if (path.startsWith('public/') && method === 'get') {
                return routes['public'].route;
            }

            // if route is not defined return 404 not found error message handler
            if (typeof (routes[path]) === 'undefined') {
                return routes['notFound'].route;
            }
            // return 405 method not allowed
            if (method !== routes[path].method) {
                return routes['notAllowed'].route;
            }
            // bingo
            return routes[path].route;
        }
    };
};
const theRouter = new Router();

module.exports = theRouter;
