'use strict';

/**
 * Controller for Humm payment
 *
 */

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var URLUtils = require('dw/web/URLUtils');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');

server.get('PrepareRedirect',
    server.middleware.https,
    function (req, res, next) {
        var order = OrderMgr.getOrder(decodeURIComponent(req.querystring.hummOrderNo));
        var countryCode = order.getBillingAddress().getCountryCode().toString();
        var gatewayURL = require('*/cartridge/scripts/utils/hummUtils').getSitePreference().hummGatewayURL;
        if (gatewayURL.indexOf('.' + countryCode.toLowerCase()) > -1) {
            res.render('checkout/hummredirect', {
                orderObject: OrderMgr.getOrder(decodeURIComponent(req.querystring.hummOrderNo)),
                Signature: decodeURIComponent(req.querystring.hummSignature)
            });
        } else {
            Transaction.begin();
            OrderMgr.failOrder(order);
            Transaction.commit();
            var redirectURL = URLUtils.https('Checkout-Begin', 'error', Resource.msg('humm.gateway.url', 'humm', null) + ' ' + countryCode.toUpperCase());
            res.render('checkout/redirect', {
                HummRedirectUrl: redirectURL
            });
        }
        next();
    });

server.post('IsHumm',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var currentBasket = BasketMgr.getCurrentOrNewBasket();
        var paymentInstExists = false;
        var hummPaymentInstruments = currentBasket.getPaymentInstruments('HUMM');
        var paymentInstruments = currentBasket.getPaymentInstruments();
        if (hummPaymentInstruments.length > 0 && hummPaymentInstruments.length === paymentInstruments.length) {
            paymentInstExists = true;
        } else {
            Transaction.wrap(function () {
                currentBasket.createPaymentInstrument(
                    'HUMM', currentBasket.totalGrossPrice
                );
            });
            paymentInstExists = true;
        }
        res.json({
            isHumm: paymentInstExists,
            resource: {
                pleaseWait: Resource.msg('redirect.message', 'humm', null),
                redirectMessage: Resource.msg('redirect.notification', 'humm', null)
            }
        });
        return next();
    });

server.post('Redirect',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
        var currentBasket = BasketMgr.getCurrentBasket();
        if (!currentBasket) {
            res.json({
                error: true,
                cartError: true,
                fieldErrors: [],
                serverErrors: [],
                cartUrl: URLUtils.url('Cart-Show').toString()
            });
            return next();
        }
        if (req.session.privacyCache.get('fraudDetectionStatus')) {
            res.json({
                error: true,
                cartError: true,
                cartUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
                errorMessage: Resource.msg('error.technical', 'checkout', null)
            });
            return next();
        }
        var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
        if (validationOrderStatus.error) {
            res.json({
                error: true,
                errorMessage: validationOrderStatus.message
            });
            return next();
        }
        // Check to make sure there is a shipping address
        if (currentBasket.defaultShipment.shippingAddress === null) {
            res.json({
                error: true,
                errorStage: {
                    stage: 'shipping',
                    step: 'address'
                },
                errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
            });
            return next();
        }
        // Check to make sure billing address exists
        if (!currentBasket.billingAddress) {
            res.json({
                error: true,
                errorStage: {
                    stage: 'payment',
                    step: 'billingAddress'
                },
                errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
            });
            return next();
        }
        // Calculate the basket
        Transaction.wrap(function () {
            basketCalculationHelpers.calculateTotals(currentBasket);
        });
        // Re-validates existing payment instruments
        var validPayment = COHelpers.validatePayment(req, currentBasket);
        if (validPayment.error) {
            res.json({
                error: true,
                errorStage: {
                    stage: 'payment',
                    step: 'paymentInstrument'
                },
                errorMessage: Resource.msg('error.payment.not.valid', 'checkout', null)
            });
            return next();
        }
        // Re-calculate the payments.
        var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
        if (calculatedPaymentTransactionTotal.error) {
            res.json({
                error: true,
                errorMessage: Resource.msg('error.technical', 'checkout', null)
            });
            return next();
        }
        // Creates a new order.
        var order = COHelpers.createOrder(currentBasket);
        if (!order) {
            res.json({
                error: true,
                errorMessage: Resource.msg('error.technical', 'checkout', null)
            });
            return next();
        }
        // Handles payment authorization
        var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo);
        if (handlePaymentResult.error) {
            res.json({
                error: true,
                errorMessage: Resource.msg('error.technical', 'checkout', null)
            });
            return next();
        }
        var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
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
        var hummSignatureResponse = require('*/cartridge/scripts/checkout/signatureGeneration').getSignature(order);
        var redirectURL = URLUtils.https('HummRedirect-PrepareRedirect').toString();
        var countryCode = currentBasket.billingAddress.countryCode ? currentBasket.billingAddress.countryCode.value.toUpperCase() : '';
        res.json({
            error: false,
            hummSignatureResponse: hummSignatureResponse,
            countryCode: countryCode,
            orderNo: order.orderNo,
            redirectUrl: redirectURL
        });
        return next();
    });

module.exports = server.exports();
