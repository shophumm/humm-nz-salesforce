'use strict';

var server = require('server');

var Checkout = module.superModule;
server.extend(Checkout);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Main entry point for Checkout
 */

/**
* overrides Begin method to show afterpay error message
*/
server.append(
    'Begin',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var currentBasket = BasketMgr.getCurrentBasket();
        var paymentMethodEnableFlag = require('*/cartridge/scripts/util/getHummPriceRangeForWidget').getCheckoutWidgetData(currentBasket);
        var hummForm = server.forms.getForm('humm');

        res.render('checkout/checkout', {
            showHummPaymentMethod: paymentMethodEnableFlag,
            customForms: {
                hummForm: hummForm
            }
        });

        return next();
    }
);


module.exports = server.exports();
