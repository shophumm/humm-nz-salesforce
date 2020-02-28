'use strict';

/**
 * Controller to handle the response from Humm
 *
 * @module controllers/Cancel
 */

var server = require('server');

/* API Includes */
var URLUtils = require('dw/web/URLUtils');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');

/**
 * Handles the redirect if payment is declined.
 */

server.get(
    'HandleResponse',
    server.middleware.https,
    function (req, res, next) {
        var orderNo = req.querystring.order_id;
        var order = OrderMgr.getOrder(orderNo);
        Transaction.begin();
        OrderMgr.failOrder(order, false);
        Transaction.commit();
        var redirectURL = URLUtils.https('Home-Show');
        res.render('checkout/redirect', {
            HummRedirectUrl: redirectURL
        });
        next();
    }
);

module.exports = server.exports();
