'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var Transaction = require('dw/system/Transaction');

/**
 * Verifies that entered Gift card has sufficient balance
 * @param {dw.order.Basket} basket Current users's basket
 * @return {Object} an object that contains error information
 */
function Handle(basket) {
    Transaction.wrap(function () {
        var paymentInstruments = basket.getPaymentInstruments();

        collections.forEach(paymentInstruments, function (item) {
            basket.removePaymentInstrument(item);
        });

        basket.createPaymentInstrument(
            'HUMM', basket.totalGrossPrice
        );
    });

    return { fieldErrors: {}, serverErrors: [], error: false };
}

/**
 * default hook if no payment processor is supported
 * @return {Object} an object that contains error information
 */
function Authorize() {
    return { fieldErrors: {}, serverErrors: [], error: false };
}

exports.Handle = Handle;
exports.Authorize = Authorize;
