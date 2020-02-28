'use strict';
/* global response, empty */

/* API Includes */
var URLUtils = require('dw/web/URLUtils');
var Transaction = require('dw/system/Transaction');

var Cart = require('*/cartridge/scripts/models/CartModel');

/**
 * Handles Humm order process.
 * @param {Object} args - arguments
 * @returns {Object} success
 */
function Handle(args) {
    var cart = Cart.get(args.Basket);

    Transaction.wrap(function () {
        cart.removeExistingPaymentInstruments('HUMM');
        cart.createPaymentInstrument('HUMM', cart.getNonGiftCertificateAmount());
    });

    return { success: true };
}

/**
 * Authorizes Humm Order process.
 * @param {Object} args - arguments
 * @returns {Object} redirected
 */
function Authorize(args) {
    var order = args.Order;
    var orderNo = args.OrderNo;

    var hummSignatureResponse = require('*/cartridge/scripts/checkout/signatureGeneration').getSignature(order);
    var redirectURL = URLUtils.https('HummRedirect-PrepareRedirect', 'orderNo', orderNo, 'Signature', hummSignatureResponse);

    if (!empty(redirectURL)) {
        response.redirect(redirectURL);
        return { redirected: true };
    }

    return { redirected: false };
}

/*
 * Local methods
 */
exports.Handle = Handle;
exports.Authorize = Authorize;
