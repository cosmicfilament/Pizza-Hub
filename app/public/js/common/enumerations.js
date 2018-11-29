'use strict';
/* eslint no-console: off */

(function () {
    const root = typeof self == 'object' && self.self === self && self
        || typeof global == 'object' && global.global === global && global || this || {};

    const enums = {};

    if (typeof (exports) !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = enums;
        }
        exports.enums = enums;
    } else {
        root.enums = enums;
    }

    // DEBUG
    enums.DEBUG = true;

    // MISC
    enums.ONE_MINUTE = 1000 * 60;
    enums.ONE_HOUR = enums.ONE_MINUTE * 60;
    enums.DATE_START = new Date('January 1, 2018 00:00:00');

    // various
    enums.CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    enums.UNIQUE_ID_LENGTH = 10;
    enums.PHONE_NUMBER_LENGTH = 10;
    enums.MAX_INT = Number.MAX_SAFE_INTEGER;

    //basket
    enums.BASKETID_LENGTH = enums.PHONE_NUMBER_LENGTH + 1 + enums.UNIQUE_ID_LENGTH;
    enums.MAX_TIMESTAMP_LENGTH = 25; // human readable timestamp
    enums.BASKET_EXPIRY = enums.ONE_HOUR * 2;

    // customer
    enums.MAX_NAME_STRING = 20; //max length of first or last name
    enums.MINIMUM_PASSWORD_LENGTH = 8;
    enums.MAX_ADDRESS_LENGTH = 250; //if address is longer than this move
    enums.MAX_EMAIL_LENGTH = 254; //not sure of the validity of this cribbed from same source as email validation code

    // tokens
    enums.TOKEN_EXPIRY = enums.ONE_HOUR;
    enums.TOKENID_LENGTH = 15;

    // workers
    enums.LOG_ROTATION_CHECK = enums.ONE_MINUTE * 15;
    enums.CLEANUP_EXPIRED_TOKENS_CHECK = enums.ONE_MINUTE;

}).call(this);
