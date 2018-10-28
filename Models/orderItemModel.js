'use strict';
/*eslint quotes: ["off", "double"]*/

/**
    * @file OrderItem module holds various classes that parse the menu.json file and create menu selection and choice items
    * @module orderItem module
    * @description classes that map the menu items from the menu.json file. Used by the basketModule
    * @exports MenuTitle, OrderItem, and Choice classes
*/

/**
     * @summary MenuTitle class
     * @class
     * @classdesc restaurant name in the menu.json file
*/
class MenuTitle {
    constructor(obj) {
        this.item = obj;
    }
    /**
         * @static
         * @summary getter menuTitle
         * @returns title
         * @throws nothing
    */
    get menuTitle() {
        return this.item;
    }
}
/**
     * @summary OrderSelection class
     * @class
     * @classdesc wraps the selection portion of the menu.json file
*/
class OrderSelection {
    constructor(selection) {
        this.init(selection);
    }
    /**
           * @summary init
           * @description creates a selection and delegates down to the choice for its creation
           * @throws nothing
       */
    init(selection) {
        this.selection = selection.selection;
        this.choices = this.parseChoices(selection.choices);
    }
    /**
        * @summary parseChoices
        * @description parses the choices from the menu.json file
        * @throws nothing
    */

    parseChoices(choices) {
        let ary = [];
        for (let choice of choices) {
            // skip the menu title and only grab menu selections
            if (choice.hasOwnProperty('desc')) {
                ary.push(new Choice(choice));
            }
        }
        return ary;
    }
    /**
           * @summary getter total
           * @description totals all of the prices for each choice in a selection
           * @throws nothing
       */
    get total() {
        let t = 0.00;
        for (let choiceTotal of this.choices) {
            t += choiceTotal.price;
        }
        return t;
    }
}

/**
       * @summary Choice class
       * @class
       * @classdesc class that wraps a single choice from the menu.json file
   */
class Choice {
    constructor(choice) {
        this.description = choice.desc;
        this.price = choice.price;
    }
}

module.exports = {
    MenuTitle,
    OrderSelection,
    Choice
};
