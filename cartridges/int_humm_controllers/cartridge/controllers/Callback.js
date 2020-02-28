'use strict';

/**
 * Controller to handle the response from Humm
 *
 * @module controllers/Callback
 */
/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');

/* Script Modules */
var guard = require('*/cartridge/scripts/guard');


var Order = require('*/cartridge/scripts/models/OrderModel');

var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');
var Utils = require('*/cartridge/scripts/utils/hummUtils');
var saveParameters = require('*/cartridge/scripts/checkout/saveParameters');

var Logger = LogUtils.getLogger("CallbackController");


/**
 * Handles the payment status returned by the Humm. Based on the status Order will be submitted .
 */

function HandleResponse(){
	var orderNo = request.httpParameterMap.x_reference.stringValue;
	var order = OrderMgr.getOrder(orderNo);
	var paymentInstrument = Utils.getPaymentInstrument(order);
    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
    var paymentStatus = request.httpParameterMap.x_result.stringValue;
    
    var orderPlacementStatus;
    if (order && order.status.displayValue == "CREATED" && request.httpParameterMap.order_token.stringValue === order.getOrderToken().toString()) {
		if(paymentStatus == "completed"){
			orderPlacementStatus = Order.submit(order);

	        if (!orderPlacementStatus.error) {
	        	session.forms.singleshipping.clearFormElement();
	            session.forms.multishipping.clearFormElement();
	            session.forms.billing.clearFormElement();
	        }
	
		}
		else if(paymentStatus == "failed"){
			Transaction.begin();
			OrderMgr.failOrder(order);
			Transaction.commit();
		}
		
		saveParameters.saveCustomAttributes(order, paymentInstrument, paymentProcessor, request.httpParameterMap);
    }
		
}
/*
* Module exports
*/

/*
* Web exposed methods
*/

/** Payment status handling.
 * @see module:controllers/Callback~HandleResponse */
exports.HandleResponse = guard.ensure(['https'], HandleResponse);