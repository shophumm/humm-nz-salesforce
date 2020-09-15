'use strict';

/**
 * Controller to handle the response from Humm
 *
 * @module controllers/Cancel
 */

/* API Includes */
var URLUtils = require('dw/web/URLUtils');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var Utils = require('*/cartridge/scripts/utils/hummUtils');
var PaymentMgr = require('dw/order/PaymentMgr');
var saveParameters = require('*/cartridge/scripts/checkout/saveParameters');


/* Script Modules */
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');
var Logger = LogUtils.getLogger("CancelController");


/**
 * 
 * @param order
 * @returns
 */
function saveCancelParameters(order) {
	
	var paymentInstrument = Utils.getPaymentInstrument(order);
	var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.getPaymentMethod()).getPaymentProcessor();
	var currentTime = new Date().toJSON();
    var timestamp = currentTime.replace(/\.\d\d\dZ/, 'Z');
    
    try {
    	
    var cancelEntry = {
			x_gateway_reference: 0,
			x_result: 'cancel',
			x_timestamp: timestamp,
			x_amount: order.getTotalGrossPrice().toNumberString()
	    };
    saveParameters.saveCustomAttributes(order,paymentInstrument, paymentProcessor,cancelEntry);
    }
    catch (e)
    {
    	Logger.debug("end error:x_cancel_url{0} ",e);
    }
	
}

/**
 * Handles the redirect if payment is declined.
 */

function HandleResponse(){
	
	var orderNo = request.httpParameterMap.order_id.stringValue;
	var orderToken = request.httpParameterMap.order_token.stringValue;
	var order = OrderMgr.getOrder(orderNo);
	
    Logger.debug("start:x_cancel_url token {0} (== or !=)  {1}",orderToken,order.getOrderToken().toString());


	try {
		if (order.getOrderToken().toString() == orderToken) {
			Transaction.begin();
			OrderMgr.failOrder(order, false);
			Transaction.commit();
			saveCancelParameters(order);
		}  
		Logger.debug("end:x_cancel: order token {0} != {1}", orderToken,order.getOrderToken().toString())
	} catch (e) {
		Logger.debug("end:x_cancel_exception {0}", e);
	} finally {
		var redirectURL = URLUtils.https('DeclinedRedirect-Declined', 'paymentStatus', request.httpParameterMap.paymentStatus.stringValue ? request.httpParameterMap.paymentStatus.stringValue: 'cancelled');
		app.getView({
			HummRedirectUrl : redirectURL
		}).render('checkout/redirect');
	}
}

/*
* Web exposed methods
*/

/**
 * @see module:controllers/Cancel~ HandleResponse*/
exports.HandleResponse = guard.ensure(['https'], HandleResponse);