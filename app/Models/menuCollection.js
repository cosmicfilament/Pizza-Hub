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

        for (let x = 0; x < ary.length; x++) {
            const group = ary[x];
            this._push(group.menuGroup);
        }
    }

    _push(group) {
        this.push(new MenuGroup(group));
    }

    get total() {
        return this.reduce(function (sum, current) {
            return sum + current.getTotal();
        });
    }
}

class MenuGroup extends Array {
    constructor(ary) {
        super();

        for (let x = 0; x < ary.length; x++) {
            const item = ary[x];
            this._push(item);
        }
    }

    _push(item) {
        this.push(new MenuItem(item));
    }
    /**
        * @summary getter total
        * @description totals all of the prices for each choice in a selection
        * @throws nothing
        */
    get total() {
        return this.reduce(function (sum, current) {
            return sum + current.getTotal();
        });
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
    MenuGroup,
    MenuItem,
    Choice
};
