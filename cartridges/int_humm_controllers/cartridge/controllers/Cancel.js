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

/* Script Modules */
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');
var Logger = LogUtils.getLogger("CancelController");


/**
 * Handles the redirect if payment is declined.
 */

function HandleResponse(){
	var orderNo = request.httpParameterMap.order_id.stringValue;
	var order = OrderMgr.getOrder(orderNo);
	
	Transaction.begin();
	OrderMgr.failOrder(order, false);
	Transaction.commit();

	var redirectURL = URLUtils.https("Home-Show");
	
	 app.getView({
		HummRedirectUrl : redirectURL
    }).render('checkout/redirect');
	
}

/*
* Web exposed methods
*/

/**
 * @see module:controllers/Cancel~ HandleResponse*/
exports.HandleResponse = guard.ensure(['https'], HandleResponse);