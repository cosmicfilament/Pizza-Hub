'use strict';

/**
 * @file loads a customizable list of order items
 * @module orderBuilder.js
 * @exports orderBuilder
 * @todo wrap in try/catch
 */

const helpers = require('../../public/js/common/helpers');
const logs = require('../../utils/logs');

const summaryContentBuilder = {};

summaryContentBuilder.buildSummaryContent = function (templateFactory, collection) {

    let htmlSummaryItemsWrapperTemplate = templateFactory.getTemplate('orderSummaryWrapper');
    htmlSummaryItemsWrapperTemplate = htmlSummaryItemsWrapperTemplate.replace('@@@orderSummaryHeader@@@', templateFactory.getTemplate('orderSummaryHeader'));

    let htmlItems = '';

    for (let value of collection) {
        const item = value[1];

        if (helpers.validateObject(item)) {

            let htmlSummaryItemTemplate = templateFactory.getTemplate('orderSummaryItem');
            htmlSummaryItemTemplate = htmlSummaryItemTemplate.replace('@@orderItemId@@', item.id);
            htmlSummaryItemTemplate = htmlSummaryItemTemplate.replace('@@orderItemItem@@', item.item);
            htmlSummaryItemTemplate = htmlSummaryItemTemplate.replace('@@orderItemTotalQuantity@@', '---------');
            htmlSummaryItemTemplate = htmlSummaryItemTemplate.replace('@@orderItemPrice@@', '-----');
            htmlSummaryItemTemplate = htmlSummaryItemTemplate.replace('@@orderItemTotalPrice@@', '--------');

            let htmlChoices = '';
            const choices = item.choices;
            let htmlSummaryChoicesWrapperTemplate = templateFactory.getTemplate('orderSummaryWrapper');

            if (helpers.validateArray(choices)) {

                for (let choice of choices) {
                    if (helpers.validateObject(choice)) {

                        let htmlSummaryChoiceTemplate = templateFactory.getTemplate('orderSummaryChoice');
                        htmlSummaryChoiceTemplate = htmlSummaryChoiceTemplate.replace('@@orderItemId@@', item.id);
                        htmlSummaryChoiceTemplate = htmlSummaryChoiceTemplate.replace('@@buttonName@@', choice.id);
                        htmlSummaryChoiceTemplate = htmlSummaryChoiceTemplate.replace('@@orderChoiceId@@', choice.id);
                        htmlSummaryChoiceTemplate = htmlSummaryChoiceTemplate.replace('@@orderChoiceDesc@@', choice.desc);
                        htmlSummaryChoiceTemplate = htmlSummaryChoiceTemplate.replace('@@orderChoiceQuantity@@', choice.quantity);
                        htmlSummaryChoiceTemplate = htmlSummaryChoiceTemplate.replace('@@orderChoicePrice@@', choice.price);
                        htmlSummaryChoiceTemplate = htmlSummaryChoiceTemplate.replace('@@orderChoiceTotalPrice@@', helpers.createFormattedTotalPrice(choice.totalPrice));

                        htmlChoices += htmlSummaryChoiceTemplate;
                    }
                }

                let htmlSummaryFooterChoicesTemplate = templateFactory.getTemplate('orderSummaryFooter');
                htmlSummaryFooterChoicesTemplate = htmlSummaryFooterChoicesTemplate.replace('@@metadataQuantity@@', helpers.createFormattedTotalQuantity(item.totalQuantity));
                htmlSummaryFooterChoicesTemplate = htmlSummaryFooterChoicesTemplate.replace('@@metadataPrice@@', '-----');
                htmlSummaryFooterChoicesTemplate = htmlSummaryFooterChoicesTemplate.replace('@@metadataTotalPrice@@', helpers.createFormattedTotalPrice(item.totalPrice));

                htmlSummaryChoicesWrapperTemplate = htmlSummaryChoicesWrapperTemplate.replace('@@@orderSummaryHeader@@@', '');
                htmlSummaryChoicesWrapperTemplate = htmlSummaryChoicesWrapperTemplate.replace('@@@orderSummaryHtmlCollection@@@', htmlChoices);
                htmlSummaryChoicesWrapperTemplate = htmlSummaryChoicesWrapperTemplate.replace('@@@orderSummaryFooter@@@', htmlSummaryFooterChoicesTemplate);
            }

            htmlSummaryItemTemplate += htmlSummaryChoicesWrapperTemplate;


            htmlItems += htmlSummaryItemTemplate;
        }
    }

    let htmlSummaryFooterItemsTemplate = templateFactory.getTemplate('orderSummaryFooter');
    htmlSummaryFooterItemsTemplate = htmlSummaryFooterItemsTemplate.replace('@@metadataQuantity@@', helpers.createFormattedTotalQuantity(collection.totalQuantity));
    htmlSummaryFooterItemsTemplate = htmlSummaryFooterItemsTemplate.replace('@@metadataPrice@@', '');
    htmlSummaryFooterItemsTemplate = htmlSummaryFooterItemsTemplate.replace('@@metadataTotalPrice@@', helpers.createFormattedTotalPrice(collection.totalPrice));

    htmlSummaryItemsWrapperTemplate = htmlSummaryItemsWrapperTemplate.replace('@@@orderSummaryHtmlCollection@@@', htmlItems);
    htmlSummaryItemsWrapperTemplate = htmlSummaryItemsWrapperTemplate.replace('@@@orderSummaryFooter@@@', htmlSummaryFooterItemsTemplate);

    let htmlorderSummaryFrmTemplate = templateFactory.getTemplate('orderSummaryFrm');
    htmlorderSummaryFrmTemplate = htmlorderSummaryFrmTemplate.replace('@@@theWholeEnchalada@@@', htmlSummaryItemsWrapperTemplate);
    if (helpers.validateString(htmlorderSummaryFrmTemplate)) {
        logs.log('Summary Form template Loaded.', 'b', 'blue');
        return htmlorderSummaryFrmTemplate;
    }
    return false;
};

module.exports = summaryContentBuilder;
