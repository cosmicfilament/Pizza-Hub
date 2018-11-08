'use strict';

/**
* @file server file. starts the http and https server, listens for requests and sends responses
* @module server.js
* @description server file. starts the http and https server, listens for requests and sends responses
*/

const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const router = require('./router');
const helpers = require('./../utils/helpers');
const logs = require('./../utils/logs');
const { BASE_DIR, CONFIG } = require('./config');

const server = {};

// Instantiate the http server
server.httpServer = http.createServer((req, res) => {
    _server(req, res);
});

// the https server requires the cert and key files
server.httpsServerOptions = {
    'key': fs.readFileSync(`${BASE_DIR}/${CONFIG.keyFile}`),
    'cert': fs.readFileSync(`${BASE_DIR}/${CONFIG.certFile}`)
};

// instantiate the https server
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    _server(req, res);
});

// Init script
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(CONFIG.httpPort, () => {
        logs.log(`The http server is listening on port ${CONFIG.httpPort}.`, 'b', 'blue');
    });

    // Start the HTTPS server
    server.httpsServer.listen(CONFIG.httpsPort, () => {
        logs.log(`The https server is listening on port ${CONFIG.httpsPort}.`, 'b', 'blue');
        logs.log('-------------------------------------------', 'b', 'blue');
    });

};

// common server logic
const _server = (req, res) => {
    // Get the URL and parse it
    // true means get the querystring too
    let parsedUrl = url.parse(req.url, true);

    // Get the Path eg: http://xyz.com/foo
    // path is just the foo part.
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    trimmedPath = (trimmedPath === '') ? 'home' : trimmedPath;

    // get the querystring as an object
    let QueryStringObject = parsedUrl.query;
    // Get the HTTP method
    let method = req.method.toLowerCase();

    // Get the Headers object
    let HeadersObject = req.headers;

    // Get the payload as it is streamed in
    let Decoder = new StringDecoder('utf-8');
    let reqBuffer = '';

    // called while data is streaming if there is a payload
    req.on('data', data => {
        reqBuffer += Decoder.write(data);
    });

    // will always be called at the end of the request
    req.on('end', data => {
        // last chunk added if there is a payload
        reqBuffer += Decoder.end(data);
        const requestObj = {
            'trimmedPath': trimmedPath,
            'queryStringObject': QueryStringObject,
            'method': method,
            'headers': HeadersObject,
            'payload': helpers.parseJsonToObject(reqBuffer)
        };

        try {
            const handler = router.route(requestObj.method, requestObj.trimmedPath);
            // On success: process the request and return a message or data response
            handler(requestObj, res)
                .then((responseObj) => {
                    logs.log(`Response sent ${responseObj.statusCode}`, 'c', 'green');
                    res.setHeader('Content-Type', responseObj.content_type);
                    res.writeHead(responseObj.statusCode);
                    res.end(responseObj.payload);
                })
                // On error: thrown by the promise objects usually as a result of
                // operator error or data validation errors then return helpful error response
                .catch((errObj) => {
                    let msg = '';
                    let status = '';
                    if (errObj.hasOwnProperty('statusCode')) {
                        msg = errObj.message;
                        status = errObj.statusCode;
                    }
                    else {
                        msg = errObj;
                        status = 400;
                    }
                    logs.log(`Promise catch handler caught error in server.handler - statusCode: ${status}, Message: ${msg}`, 'b', 'red');
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(status);
                    res.end(JSON.stringify(`Error: ${msg}.`));
                });
        }
        catch (error) { // catch any error thrown that is not a promise based error. Not good!
            logs.log(`Try/Catch error thrown in server.handler: ${error}`, 'b', 'red');
            // try to send a response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify(error));
        }
    });
};

// Export the module
module.exports = server;
