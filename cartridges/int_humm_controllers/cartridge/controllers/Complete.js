'use strict';

/**
 * Controller to handle the response from Humm
 *
 * @module controllers/Complete
 */
/* global request */
/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var URLUtils = require('dw/web/URLUtils');

/* Script Modules */
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

/**
 * Handles the payment status returned by the Humm. Based on the status Order will be submitted .
 */
function HandleResponse(){
    var redirectURL;
    var paymentStatus = request.httpParameterMap.x_result.stringValue;
    var order = OrderMgr.getOrder(request.httpParameterMap.x_reference.stringValue);
    if (paymentStatus === 'completed') {
        return app.getController('COSummary').ShowConfirmation(order);
    } else if (paymentStatus === 'failed') {
        redirectURL = URLUtils.https('DeclinedRedirect-Declined', 'paymentStatus', paymentStatus);

        app.getView({
            HummRedirectUrl: redirectURL
        }).render('checkout/redirect');
    }
}

/*
* Web exposed methods
*/

/** Payment status handling.
 * @see module:controllers/Complete~HandleResponse */
exports.HandleResponse = guard.ensure(['https'], HandleResponse);
