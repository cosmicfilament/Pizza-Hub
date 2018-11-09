'use strict';
/*eslint quotes: ["off", "double"]*/

/**
* @file menuCollection module holds various classes that parse the menu.json file.
* @module menuCollection
* @description classes that map the menu items from the menu.json file.
* @exports MenuCollection
* @exports MenuItem
* @exports Choice
*/

class MenuCollection extends Array {
    constructor(ary) {
        super();
        ary.forEach(item => this._push(item));
    }

    _push(item) {
        this.push(new MenuItem(item));
    }
}

/**
* @summary MenuItem class
* @class
* @classdesc wraps the selection portion of the menu.json file
*/
class MenuItem {
    constructor(item) {
        this.init(item);
    }
    /**
    * @summary init
    * @description creates a selection and delegates down to the choice for its creation
    * @throws nothing
    */
    init(item) {
        this.item = item.item;
        this.parent = item.parent;
        this.choices = this.parseChoices(item.choices);
    }
    /**
    * @summary parseChoices
    * @description parses the choices from the menu.json file
    * @throws nothing
    */
    parseChoices(choices) {
        let ary = [];
        for (let choice of choices) {
            ary.push(new Choice(choice));
        }
        return ary;
    }
    /**
     * @summary getter total
     * @description totals all of the prices for each choice in a selection
     * @throws nothing
     */
    get total() {
        let total = 0.00;
        for (let choiceTotal of this.choices) {
            total += choiceTotal.price;
        }
        return total;
    }
}

/**
 * @summary Choice class
 * @class
 * @classdesc class that wraps a single choice from the menu.json file
 */
class Choice {
    constructor(choice) {
        this.desc = choice.desc;
        this.price = choice.price;
    }
}

module.exports = {
    MenuCollection,
    MenuItem,
    Choice
};
