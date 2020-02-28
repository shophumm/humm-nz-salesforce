'use strict';

/**
 * Controller to handle the response from Humm
 *
 * @module controllers/Complete
 */

var server = require('server');

/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var URLUtils = require('dw/web/URLUtils');

/**
 * Handles the payment status returned by the Humm. Based on the status Order will be submitted .
 */

server.get(
    'HandleResponse',
    server.middleware.https,
    function (req, res, next) {
        var redirectURL;
        var paymentStatus = req.querystring.x_result;
        var order = OrderMgr.getOrder(req.querystring.x_reference);
        if (paymentStatus === 'completed') {
            res.redirect(URLUtils.url('Order-Confirm', 'ID', order.orderNo, 'token', order.orderToken));
        } else if (paymentStatus === 'failed') {
            redirectURL = URLUtils.https('DeclinedRedirect-Declined', 'paymentStatus', paymentStatus);
            res.render('checkout/redirect', {
                HummRedirectUrl: redirectURL
            });
        }
        next();
    }
);

module.exports = server.exports();
