'use strict';
/* global request, response */
/**
 * Controller for Humm payment
 *
 */

/**
 * redirects to specific actions
 * */
function performAction() {
    var orderNo = request.httpParameterMap.orderno.value;
    var amount = request.httpParameterMap.amount.value;
    var refundReason = request.httpParameterMap.reason.value;
    var transActions = require('~/cartridge/scripts/transActions');
    var result = transActions.refund(orderNo, amount, refundReason);

    response.writer.print(JSON.stringify(result));
}

/*
 * Exposed web methods
 */
performAction.public = true;

exports.Action = performAction;
