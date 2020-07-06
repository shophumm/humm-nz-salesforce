/* global request */
/**
 * Prepare Redirect
 * 
 */

/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');

/* Script Modules */
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

var Logger = require('dw/system/Logger');

// Global Variables
var defaultLogFilePrefix = 'humm';

var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');

/**
 * Prepare redirect
 */
function prepare() {
	var order = OrderMgr.getOrder(request.httpParameterMap.orderNo.stringValue);
	var countryCode = order.getBillingAddress().getCountryCode().toString();
	var gatewayURL = require('*/cartridge/scripts/utils/hummUtils')
			.getSitePreference().hummGatewayURL;

	var LoggerHumm = LogUtils.getLogger("PrepareHummRedirect");

	Logger.debug("x_Humm_PrepareURL  Start Transaction from {0} {1} {2}",
			order, countryCode, gatewayURL);

	// countryCodeAU = 'au';
	// countryCodeNZ = 'nz';

	if (gatewayURL.indexOf('.' + countryCode) > -1 ) {
		app
				.getView(
						{
							orderObject : OrderMgr
									.getOrder(request.httpParameterMap.orderNo.stringValue),
							Signature : request.httpParameterMap.Signature.stringValue
						}).render('checkout/hummredirect');
	} else {
		Transaction.begin();
		OrderMgr.failOrder(order);
		Transaction.commit();
		var redirectURL = URLUtils.https('COSummary-Start', 'error', Resource
				.msg('humm.gatway.url', 'humm', null)
				+ ' ' + countryCode.toUpperCase());
		app.getView({
			HummRedirectUrl : redirectURL
		}).render('checkout/redirect');
	}
}

exports.PrepareRedirect = guard.ensure([ 'https' ], prepare);
