'use strict';

/**
 * Controller to handle the response from Humm
 * 
 * @module controllers/Callback
 */
/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');

/* Script Modules */
var guard = require('*/cartridge/scripts/guard');
var OrderMo = require('*/cartridge/scripts/models/OrderModel');
var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');
var Utils = require('*/cartridge/scripts/utils/hummUtils');
var saveParameters = require('*/cartridge/scripts/checkout/saveParameters');
/**
 * Handles the payment status returned by the Humm. Based on the status Order
 * will be submitted .
 */



function HandleResponse() {

	var paymentStatus = request.httpParameterMap.x_result.stringValue;
	var orderReference = request.httpParameterMap.x_reference.stringValue ? request.httpParameterMap.x_reference.stringValue: request.x_reference;
	var paymentStatus = request.httpParameterMap.x_result.stringValue ? request.httpParameterMap.x_result.stringValue: request.x_result;
	var hummSignature = request.httpParameterMap.x_signature.stringValue;
	var order = OrderMgr.getOrder(orderReference);
	var paymentInstrument = Utils.getPaymentInstrument(order);
	var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
	
	var orderToken = request.httpParameterMap.order_token.stringValue
	var localOrderToken = order.getOrderToken().toString()

	var sitePreferences = Utils.getSitePreference();
	var hummAPICallbackEnable = sitePreferences.hummAPICallbackEnable;
	var hummSignatureProcess = require('*/cartridge/scripts/checkout/hummSignature').getTransactionSignature(request);

	var Logger = LogUtils.getLogger("CallbackController");

	try {
		Logger.debug("start:x_callback_url enable status and signature {0}  {1} (compare)  {2} ",hummAPICallbackEnable, hummSignature,hummSignatureProcess);

		if (hummAPICallbackEnable) {
			if (hummSignature == hummSignatureProcess) {
				Logger.debug("x_callback_url Start from {0} {1} Token {2} {3} ",paymentStatus, order.getStatus(),orderToken, localOrderToken);
				if (order && order.getStatus() == Order.ORDER_STATUS_CREATED && orderToken === localOrderToken) {
					Transaction.wrap(function() {
						let statusPlace ='';
						if (paymentStatus === 'completed' && order.getStatus() == Order.ORDER_STATUS_CREATED) {
							statusPlace = OrderMgr.placeOrder(order)
						} else if (paymentStatus === 'failed' && order.getStatus() != Order.ORDER_STATUS_FAILED) {
							statusPlace = OrderMgr.failOrder(order);
						}
					});
					saveParameters.saveCustomAttributes(order,paymentInstrument, paymentProcessor,request.httpParameterMap);
					Logger.debug("x_callback HUMM-STATUS {0}",paymentStatus);
				}
			} else {
				Logger.debug(" x_callback_url end and wrong signature {0}  {1} (compare)  {2} ",hummAPICallbackEnable, hummSignature,hummSignatureProcess);
			}
		}
		else {
			Logger.debug("x_callback_disable {0}",hummAPICallbackEnable);
		}

	}
 	catch (e) {
		Logger.debug("x_callback_exception {0}", e);

	} finally {
		Logger.debug('end_x_call_back')
	}
}
/*
 * Module exports
 */

/*
 * Web exposed methods
 */

/**
 * Payment status handling.
 * 
 * @see module:controllers/Callback~HandleResponse
 */
exports.HandleResponse = guard.ensure([ 'https' ], HandleResponse);