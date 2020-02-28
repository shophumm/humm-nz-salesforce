/**
* Redirected to this controller if the payment status is 'failed'
*
* @module  controllers/DeclinedRedirect
*/
/* global request */

'use strict';

/* Script Modules */
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

/**
 * Declined payment redirect
 * */
function declined() {
    app.getView({
        paymentStatus: request.httpParameterMap.paymentStatus.stringValue
    }).render('checkout/declinedredirect');
}

/* Exports of the controller */
exports.Declined = guard.ensure(['https'], declined);
