/**
* Script file for signature generation.
*
*  @input MerchantID : String
*  @input TransactionID: String
*  @input RefundAmount: Float
*  @input RefundReason: String
*  @input CountryCode: String
*  @output Signature : String
*
*/
var SortedMap = require('dw/util/SortedMap');

var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');
var Utils = require('*/cartridge/scripts/utils/hummUtils');
var Logger = LogUtils.getLogger('RefundSignature');

/**
 * hashContent
 * @param {string} requestParam - requestParam
 * @param {string} apiKey - apiKey
 * @returns {string} hmac
 * */
function hashContent(requestParam, apiKey) {
    var Encoding = require('dw/crypto/Encoding');
    var Mac = require('dw/crypto/Mac');

    var mac = new Mac(Mac.HMAC_SHA_256);
    var sha = mac.digest(requestParam, apiKey);

    var hmac = Encoding.toHex(sha);

    Logger.debug('Final refund signature : ' + hmac);

    return hmac;
}

/**
 * generateSignature
 * @param {string} merchantID - merchantID
 * @param {string} transactionID - transactionID
 * @param {number} refundAmount - refundAmount
 * @param {string} refundReason - refundReason
 * @returns {string} signature
 * */
function generateSignature(merchantID, transactionID, refundAmount, refundReason) {
    var configuration = Utils.getSitePreference();
    var apiKey = configuration.hummGatewayKey;

    var map = new SortedMap();

    map.put('x_merchant_number', merchantID);
    map.put('x_purchase_number', transactionID);
    map.put('x_amount', refundAmount);
    map.put('x_reason', refundReason);

    var signatureKeySetIt = map.keySet().iterator();
    var plainText = '';

    while (signatureKeySetIt.hasNext()) {
        var key = signatureKeySetIt.next();
        var value = map.get(key);

        if (key.substring(0, 2) === 'x_') {
            plainText += key + value;
        }
    }

    Logger.debug('Refund Plain Text:' + plainText);

    var signature = hashContent(plainText, apiKey);

    return signature;
}

/*
 * Module exports
 */
module.exports = {
    getSignature: function (merchantID, transactionID, refundAmount, refundReason) {
        return generateSignature(merchantID, transactionID, refundAmount, refundReason);
    }
};
