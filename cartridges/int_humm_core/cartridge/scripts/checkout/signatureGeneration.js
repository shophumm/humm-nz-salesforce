var Site = require('dw/system/Site');
var Util = require('dw/util');
var Web = require('dw/web');
var Crypto = require('dw/crypto');

var LogUtils = require('~/cartridge/scripts/utils/hummLogUtils');
var Utils = require('~/cartridge/scripts/utils/hummUtils');
var Logger = LogUtils.getLogger('SignatureGeneration');

/**
 * hashContent
 * @param {string} requestParam - requestParam
 * @param {string} apiKey - apiKey
 * @returns {string} hmac - hmac
 * */
function hashContent(requestParam, apiKey) {
    var mac = new Crypto.Mac(Crypto.Mac.HMAC_SHA_256);
    var sha = mac.digest(requestParam, apiKey);
    var hmac = Crypto.Encoding.toHex(sha);

    return hmac;
}

/**
* Script file for signature generation.
* @param {Object} order - order
* @returns {string} signature - signature
*/
function generateSignature(order) {
    var configuration = Utils.getSitePreference();
    var merchantId = configuration.hummMerchantID;
    var apiKey = configuration.hummGatewayKey;
    var completeURL = Web.URLUtils.https('Complete-HandleResponse', 'order_id', order.orderNo, 'order_token', order.getOrderToken()).toString();
    var callbackURL = Web.URLUtils.https('Callback-HandleResponse', 'order_id', order.orderNo, 'order_token', order.getOrderToken()).toString();
    var cancelURL = Web.URLUtils.https('Cancel-HandleResponse', 'order_id', order.orderNo, 'order_token', order.getOrderToken()).toString();
    var shopName = Site.getCurrent().getID();
    var shopCountry = order.getBillingAddress().getCountryCode().toString().toUpperCase();
    var amount = order.getTotalGrossPrice().toNumberString();
    var currency = order.getCurrencyCode();
    var reference = order.orderNo;
    var customerEmailID = order.customerEmail ? order.customerEmail : '';

    var map = new Util.SortedMap();

    map.put('x_url_callback', callbackURL);
    map.put('x_url_cancel', cancelURL);
    map.put('x_url_complete', completeURL);
    map.put('x_account_id', merchantId);
    map.put('x_amount', amount);
    map.put('x_currency', currency);
    map.put('x_reference', reference);
    map.put('x_shop_country', shopCountry);
    map.put('x_shop_name', shopName);
    map.put('x_customer_email', customerEmailID);

    var signatureKeySetIt = map.keySet().iterator();
    var plainText = '';

    while (signatureKeySetIt.hasNext()) {
        var key = signatureKeySetIt.next();
        var value = map.get(key);

        if (key.substring(0, 2) === 'x_') {
            plainText += key + value;
        }
    }

    Logger.debug('Plain Text:' + plainText);

    var signature = hashContent(plainText, apiKey);

    return signature;
}

/*
 * Module exports
 */
module.exports = {
    getSignature: function (order) {
        return generateSignature(order);
    }
};
