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
var Order = require('dw/order/Order');
var Transaction = require('dw/system/Transaction');

/* Script Modules */
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');
var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');
var saveParameters = require('*/cartridge/scripts/checkout/saveParameters');
var Utils = require('*/cartridge/scripts/utils/hummUtils');
var PaymentMgr = require('dw/order/PaymentMgr');

/**
 * Handles the payment status returned by the Oixpay. Based on the status Order,token, signature and API callback 
 * will be submitted .
 */
function HandleResponse() {

	var redirectURL;
	var paymentStatus = request.httpParameterMap.x_result.stringValue;
	var order = OrderMgr.getOrder(request.httpParameterMap.x_reference.stringValue);
	var hummSignature = request.httpParameterMap.x_signature.stringValue;
	var Logger = LogUtils.getLogger("Complete-control");
	var paymentInstrument = Utils.getPaymentInstrument(order);
	var orderToken = request.httpParameterMap.order_token.stringValue
	var localOrderToken = order.getOrderToken().toString();
	var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
	var hummSignatureProcess = require('*/cartridge/scripts/checkout/hummSignature').getTransactionSignature(request);
	var statusPlace = '';
	var returnFlag =''

	Logger.debug("start:Complete: {0} status {1} payment {2} token {3} to {4}",order.getOrderNo(),order.status,paymentStatus,orderToken,localOrderToken);
	try {
		if (hummSignature != hummSignatureProcess){
			returnFlag ='sig';
			Transaction.wrap(function() {
				statusPlace = OrderMgr.failOrder(order);
				Logger.error("x_complete failed order due to sig error {0} {1} {2} ",statusPlace,hummSignature,hummSignatureProcess);
			});
		} else if (order&& orderToken != localOrderToken) {
			returnFlag = 'token';
			Transaction.wrap(function() {
				statusPlace = OrderMgr.failOrder(order);
				Logger.error("x_complete failed order due to invalid token from {0} {1} {2}",statusPlace, order.getOrderToken().toString(),orderToken);
			});
		} else if (paymentStatus === 'completed' && order.getStatus() == Order.ORDER_STATUS_CREATED) {
			Transaction.wrap(function() {
				statusPlace = OrderMgr.placeOrder(order);
				Logger.debug("x_complete placed order End {0}",statusPlace);
			});
		} else if (paymentStatus === 'failed' && order.getStatus() != Order.ORDER_STATUS_FAILED ) {
			Transaction.wrap(function() {
				statusPlace = OrderMgr.failOrder(order);
				Logger.error("x_complete failed order {0}",statusPlace);
			});
		}
	} catch (e) {
		if (order.getStatus() != Order.ORDER_STATUS_FAILED)
		{
			Transaction.wrap(function() {
				statusPlace = OrderMgr.failOrder(order);
			});
		}
		Logger.error("x_complete failed Order {0} due to exception {1}",statusPlace,e);
	} finally {
		saveParameters.saveCustomAttributes(order, paymentInstrument,paymentProcessor, request.httpParameterMap);
		if(returnFlag =='sig' || returnFlag == 'token' || paymentStatus === 'failed' ){
			redirectURL = URLUtils.https('DeclinedRedirect-Declined', 'paymentStatus', paymentStatus);
			app.getView({
				HummRedirectUrl : redirectURL
			}).render('checkout/redirect');
		}
		if (paymentStatus === 'completed') {
			Logger.debug("end:x_complete place order or confirm", statusPlace.toString);
			return app.getController('COSummary').ShowConfirmation(order);
		}
		Logger.debug("End: x_complete status {0} {1} {2} {3}",paymentStatus,returnFlag,order.getOrderNo(),order.status)
	}
} 

/*
 * Web exposed methods
 */

/**
 * Payment status handling.
 * 
 * @see module:controllers/Complete~HandleResponse
 */
exports.HandleResponse = guard.ensure([ 'https' ], HandleResponse);
