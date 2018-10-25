'use strict';

/*
*
*  Lightweight ripoff of Express
*
*/

module.exports = {
    home: () => {
        const resObj = {
            'content_type': 'text/html',
            'statusCode': '200',
            'payload': `
            <!DOCTYPE html>
            <html lang="en"><head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <title>Welcome to Pizza Hub</title></head>
            <body><h1>Welcome to Pizza Hub
            </h1></body></html>

                `};
        return Promise.resolve(resObj);
    },
    notAllowed: () => {
        const resObj = {
            'content_type': 'application/json',
            'statusCode': '405',
            'payload': JSON.stringify({ 'name': '405 - Not Allowed.' })
        };
        return Promise.resolve(resObj);
    },
    notFound: () => {
        const resObj = {
            'content_type': 'application/json',
            'statusCode': '404',
            'payload': JSON.stringify({ 'name': "404 - Not Found." })
        };
        return Promise.resolve(resObj);
    }
};
