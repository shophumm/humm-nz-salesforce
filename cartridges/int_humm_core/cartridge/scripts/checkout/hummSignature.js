var Site = require('dw/system/Site');
var Util = require('dw/util');
var Web = require('dw/web');
var Crypto = require('dw/crypto');

var LogUtils = require('~/cartridge/scripts/utils/hummLogUtils');
var Utils = require('~/cartridge/scripts/utils/hummUtils');
var Logger = LogUtils.getLogger('HummSignature');

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
* @param {Object} request from humm
* @returns {string} signature - signature
*/
function generateTransactionSignature(request) {
	var configuration = Utils.getSitePreference();
	var apiKey = configuration.hummGatewayKey;
	
	var account_id = request.httpParameterMap.x_account_id.stringValue;
	var reference  = request.httpParameterMap.x_reference.stringValue;
	var currency = request.httpParameterMap.x_currency.stringValue;
	var test     = request.httpParameterMap.x_test.stringValue;

	var purchase_number    = request.httpParameterMap.x_purchase_number.stringValue;
	var amount   = request.httpParameterMap.x_amount.stringValue;
	var gateway_reference = request.httpParameterMap.x_gateway_reference.stringValue;
	var timestamp = request.httpParameterMap.x_timestamp.stringValue;
	var result = request.httpParameterMap.x_result.stringValue;
	
    var map = new Util.SortedMap();
    map.put('x_account_id', account_id);
    map.put('x_reference', reference);
    map.put('x_currency', currency);
    map.put('x_test', test);
    map.put('x_amount', amount);
    map.put('x_gateway_reference', gateway_reference);
    map.put('x_purchase_number', purchase_number);
    map.put('x_timestamp', timestamp);
    map.put('x_result', result);
    
    var signatureKeySetIt = map.keySet().iterator();
    var plainText = '';

    while (signatureKeySetIt.hasNext()) {
        var key = signatureKeySetIt.next();
        var value = map.get(key);

        if (key.substring(0, 2) === 'x_') {
            plainText += key + value;
        }
    }

    Logger.debug('Signature Plain Text from Humm:{0}' , plainText);

    var signature = hashContent(plainText, apiKey);
    
    Logger.debug('Humm Signature {0}',signature);

    return signature;
}

/*
 * Module exports
 */
module.exports = {
    getTransactionSignature: function (request) {
        return generateTransactionSignature(request);
    }
};
