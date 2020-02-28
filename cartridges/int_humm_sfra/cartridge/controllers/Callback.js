'use strict';

/**
 * Controller to handle the response from Humm
 *
 * @module controllers/Callback
 */

var server = require('server');

/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');

var Utils = require('*/cartridge/scripts/utils/hummUtils');
var saveParameters = require('*/cartridge/scripts/checkout/saveParameters');

/**
 * Handles the payment status returned by the Humm. Based on the status Order will be submitted .
 */

server.post('HandleResponse', server.middleware.https, function (req, res, next) {
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var orderNo = req.querystring.order_id;
    var order = OrderMgr.getOrder(orderNo, req.querystring.order_token);
    var paymentInstrument = Utils.getPaymentInstrument(order);
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
    var paymentStatus = req.form.x_result;
    if (order && order.status.displayValue === 'CREATED' && req.querystring.order_token === order.getOrderToken().toString()) {
        if (paymentStatus === 'completed') {
            var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', order, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
            if (fraudDetectionStatus.status === 'fail') {
                Transaction.wrap(function () { OrderMgr.failOrder(order); });
                // fraud detection failed
                req.session.privacyCache.set('fraudDetectionStatus', true);
                res.json({
                    error: true,
                    cartError: true,
                    redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return next();
            }
            // Places the order
            var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
            if (placeOrderResult.error) {
                res.json({
                    error: true,
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return next();
            }
            COHelpers.sendConfirmationEmail(order, req.locale.id);
            res.json({
                error: false
            });
        } else if (paymentStatus === 'failed') {
            Transaction.begin();
            OrderMgr.failOrder(order);
            Transaction.commit();
        }
        saveParameters.saveCustomAttributes(order, paymentInstrument, paymentProcessor, req.form);
        return next();
    }
    res.json({
        error: true,
        errorMessage: Resource.msg('error.technical', 'checkout', null)
    });
    return next();
});

module.exports = server.exports();
