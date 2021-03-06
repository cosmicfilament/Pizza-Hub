'use strict';
/*eslint quotes: ["off", "double"]*/

(function () {

    // methodology to use module in browser as well as node js module is from underscore: https://github.com/jashkenas/underscore.git

    const root = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global || this || {};

    const _mc = {};

    if (typeof (exports) !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _mc;
        }
        exports._mc = _mc;
    } else {
        root._mc = _mc;
    }

    // is this a node js module?
    const has_require = typeof require !== 'undefined';
    let helpers = root.helpers;

    if (typeof (helpers) === 'undefined') {
        if (has_require) {
            helpers = require('./helpers.js');
        } else {
            throw new Error('Missing requires: helpers.js');
        }
    }

    // for understanding how to subclass an array I referred to this article:
    // http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/

    _mc.smartCollection = function (_array = [], id = '') {
        const thisArray = [];
        // attach our prototype methods to the array prototype
        Object.setPrototypeOf(thisArray, _mc.smartCollection.prototype);
        for (let x = 0; x < _array.length; x++) {
            const group = _array[x];
            if (helpers.validateArray(group) || helpers.validateHtmlCollection(group)) {
                thisArray.push(new _mc.smartGroup(group));
            } else {
                for (let prop in group) {
                    const value = group[prop];
                    if (helpers.validateArray(value) || helpers.validateHtmlCollection(value)) {
                        thisArray.push(new _mc.smartGroup(value));
                    } else {
                        thisArray[prop] = value;
                    }
                }
            }
        }

        thisArray.id = id;
        return thisArray;
    };

    _mc.smartCollection.prototype = new Array;


    _mc.smartCollection.prototype.setId = function (id) {
        this.id = id;
        return this;
    };

    _mc.smartCollection.prototype.getId = function () {
        return this.id;
    };

    _mc.smartGroup = function (_array, id = '') {
        const thisArray = [];
        Object.setPrototypeOf(thisArray, _mc.smartGroup.prototype);
        for (let x = 0; x < _array.length; x++) {
            const item = _array[x];
            thisArray.push(new _mc.smartItem(item));
        }
        thisArray.id = id;
        return thisArray;
    };
    _mc.smartGroup.prototype = new Array;

    _mc.smartGroup.prototype.setId = function (id) {
        this.id = id;
        return this;
    };

    _mc.smartGroup.prototype.getId = function () {
        return this.id;
    };

    // the map is a better solution for what I needed and eventually I
    // switched the remaining code to using a map
    _mc.smartMap = function (_array = [], id = '', phone = '', qty = 0,
        price = 0, expires = '', timestamp = '') {

        const thisMap = new Map();
        Object.setPrototypeOf(thisMap, _mc.smartMap.prototype);

        // properties
        thisMap.id = id;
        thisMap.phone = phone;
        thisMap.totalQuantity = qty;
        thisMap.totalPrice = price;
        thisMap.expires = expires;
        thisMap.timestamp = timestamp;

        // map
        for (let x = 0; x < _array.length; x++) {
            const item = new _mc.smartItem(_array[x]);
            if (helpers.validateObject(item)) {
                thisMap.set(item.id, item);
            }
        }
        return thisMap;
    };

    _mc.smartMap.prototype = new Map();

    _mc.smartMap.prototype.MapSet = function (key, value) {
        let item = new _mc.smartItem(value);
        this.set(key, item);
        return this;
    };

    _mc.smartMap.prototype.MapGet = function (key) {
        let item = this.get(key);
        return item;
    };

    _mc.smartMap.prototype.MapGetChild = function (key) {
        let item = this.get(key);
        if (typeof (item) !== 'undefined') {
            const choices = item.choices;
            for (let choice of choices) {
                if (choice.id === key) {
                    return choice;
                }
            }
        }
        return false;
    };

    _mc.smartMap.prototype.MapDeleteElement = function (itemKey, childKey) {
        let item = this.get(itemKey);
        if (typeof (item) !== 'undefined') {
            if (item.deleteChild(childKey)) {
                // retrieve again and test for choices.length
                item = this.get(itemKey);
                if (item.choices.length === 0) {
                    this.delete(itemKey);
                }
                this.updateTotals();
                return true;
            }
        }
        return false;
    };

    _mc.smartMap.prototype.setId = function (id) {
        this.id = id;
        return this;
    };

    _mc.smartMap.prototype.getId = function () {
        return this.id;
    };

    _mc.smartMap.prototype.setPhone = function (phone) {
        this.phone = phone;
        return this;
    };

    _mc.smartMap.prototype.getPhone = function () {
        return this.phone;
    };

    _mc.smartMap.prototype.setTotalQuantity = function (qty) {
        this.totalQuantity = qty;
        return this;
    };

    _mc.smartMap.prototype.getTotalQuantity = function () {
        return this.totalQuantity;
    };
    _mc.smartMap.prototype.setTotalPrice = function (price) {
        this.totalPrice = price;
        return this;
    };

    _mc.smartMap.prototype.getTotalPrice = function () {
        return this.totalPrice;
    };

    _mc.smartMap.prototype.setExpires = function (expires) {
        this.expires = expires;
        return this;
    };

    _mc.smartMap.prototype.getExpires = function () {
        return this.expires;
    };

    _mc.smartMap.prototype.stringify = function () {

        let theMapster = this;

        let mapStr = JSON.stringify(theMapster);

        let itemsStr = "[";
        for (let theItemizer of theMapster) {
            // index 0 is the key this is the value
            itemsStr += theItemizer[1].stringify();
            itemsStr += ",";
        }
        // kill the last comma and close the array
        itemsStr = itemsStr.replace(/,\s*$/, "]");
        // some values are numbers and need to be stringified
        itemsStr = itemsStr.replace(/":(\d+)/g, "\":\"$1\"");
        mapStr = mapStr.replace(/":(\d+)/g, "\":\"$1\"");

        // the validateString should be unnecessary but there it is
        const metaData = helpers.validateString(mapStr) ? helpers.parseJsonToObject(mapStr) : mapStr;
        const orderItems = helpers.validateString(itemsStr) ? helpers.parseJsonToObject(itemsStr) : itemsStr;

        return { "header": { metaData }, "basket": { orderItems } };
    };
    _mc.smartMap.prototype.updateTotals = function () {

        let qty = 0;
        let price = 0;

        for (let value of this) {
            const item = value[1];
            item.updateTotals();
            qty += Number(item.totalQuantity);
            price += Number(item.totalPrice);
        }
        this.totalQuantity = qty.toString();
        this.totalPrice = price.toString();
    };

    function _Item() {
        this.id = '';
        this.item = '';
        this.totalPrice = 0;
        this.totalQuantity = 0;
        this.choices = [];
    }

    _mc.ItemFactory = function () {
        return new _Item();
    };

    _mc.smartItem = function (item) {
        const thisObj = {};
        Object.setPrototypeOf(thisObj, _mc.smartItem.prototype);

        for (let prop in item) {
            if (item.hasOwnProperty(prop)) {
                if (prop === 'choices') {
                    const choices = item[prop];
                    thisObj.choices = [];
                    for (let x = 0; x < choices.length; x++) {
                        const choice = choices[x];
                        thisObj.choices.push(new _mc.smartChoice(choice));
                    }
                } else {
                    thisObj[prop] = item[prop];
                }
            }
        }
        return thisObj;
    };

    _mc.smartItem.prototype = new _Item();

    _mc.smartItem.prototype.setId = function (id) {
        this.id = id;
        return this;
    };

    _mc.smartItem.prototype.getId = function () {
        return this.id;
    };

    _mc.smartItem.prototype.deleteChild = function (childId) {
        let newChoices = [];
        let found = false;
        for (let choice of this.choices) {
            if (choice.id === childId) {
                found = true;
            }
            else {
                newChoices.push(choice);
            }
        }
        if (found) {
            this.choices = newChoices;
        }
        return found;
    };

    _mc.smartItem.prototype.stringify = function () {
        let theItem = this;
        theItem = JSON.stringify(theItem);
        return theItem;
    };

    _mc.smartItem.prototype.updateTotals = function () {
        let totalPrice = 0;
        let totalQty = 0;

        for (let choice of this.choices) {
            totalQty += Number(choice.quantity);
            totalPrice += Number(choice.totalPrice);
        }
        this.totalPrice = totalPrice.toString();
        this.totalQuantity = totalQty.toString();
    };

    function _Choice() {
        this.id = '';
        this.desc = '';
        this.price = 0;
        this.quantity = 0;
        this.totalPrice = 0;
    }

    _mc.ChoiceFactory = function () {
        return new _Choice();
    };

    _mc.smartChoice = function (choice) {
        const thisObj = {};
        Object.setPrototypeOf(thisObj, _mc.smartChoice.prototype);

        for (let prop in choice) {
            if (choice.hasOwnProperty(prop)) {
                thisObj[prop] = choice[prop];
            }
        }
        return thisObj;
    };

    _mc.smartChoice.prototype = new _Choice();

    _mc.smartChoice.prototype.setId = function (id) {
        this.id = id;
        return this;
    };

    _mc.smartChoice.prototype.getId = function () {
        return this.id;
    };

}).call(this);
