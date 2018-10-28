'use strict';

/**
    * @file router module decodes the route and sends a function handle back to the server that will be used to process the request
    * @module router.js
    * @description process the path in the request object and passes back a handle to the request handler function
*/

// defaultault routes that were used in testing and also any error handler such as 404 error
const defaultHandler = require('./../handlers/defaultHandler');
const customerHandler = require('./../handlers/customerHandler');
const orderHandler = require('./../handlers/basketHandler');
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
        //'home': { 'method': 'get', 'route': defaultHandler.home },
        'customer/create': { 'method': 'post', 'route': customerHandler.create },
        'customer/read': { 'method': 'get', 'route': customerHandler.read },
        'customer/update': { 'method': 'put', 'route': customerHandler.update },
        'customer/delete': { 'method': 'delete', 'route': customerHandler.delete },
        'order/create': { 'method': 'post', 'route': orderHandler.create },
        'order/read': { 'method': 'get', 'route': orderHandler.read },
        'order/update': { 'method': 'put', 'route': orderHandler.update },
        'order/delete': { 'method': 'delete', 'route': orderHandler.delete },
        'token/create': { 'method': 'post', 'route': tokenHandler.create },
        'token/read': { 'method': 'get', 'route': tokenHandler.read },
        'token/update': { 'method': 'put', 'route': tokenHandler.update },
        'token/delete': { 'method': 'delete', 'route': tokenHandler.delete },
        'basket/menu': { 'method': 'get', 'route': basketHandler.menu },
        'basket/checkout': { 'method': 'post', 'route': basketHandler.checkOut },
        'basket/create': { 'method': 'post', 'route': basketHandler.create },
        'basket/read': { 'method': 'get', 'route': basketHandler.read },
        'basket/update': { 'method': 'put', 'route': basketHandler.update },
        'basket/delete': { 'method': 'delete', 'route': basketHandler.delete },
        'notFound': { 'method': 'any', 'route': defaultHandler.notFound },
        'notAllowed': { 'method': 'any', 'route': defaultHandler.notAllowed }
    };

    // public method on the Router object that returns the decoded handler function
    return {
        route: function (method, path) {
            // allows any mix of upper and lower case value from client app.
            path = path.toLowerCase();
            method = method.toLowerCase();

            // if route is not defaultined return 404 not found error message handler
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
