/**
* Humm Transaction Actions
*/
/* API Includes */
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var OrderStand = require('dw/order/Order');

var Utils = require('*/cartridge/scripts/utils/hummUtils');
var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');
var Logger = LogUtils.getLogger('TransActions');

var configuration = Utils.getSitePreference();

/**
 * updates the order status
 * @param {string} orderNo - orderNo
 * */
function updateOrderStatus(orderNo) {
    var Order = OrderMgr.getOrder(orderNo);

    try {
        Transaction.begin();
        Order.setPaymentStatus(OrderStand.PAYMENT_STATUS_NOTPAID);
        Order.setStatus(OrderStand.ORDER_STATUS_CANCELLED);
        Transaction.commit();
    } catch (e) {
        Transaction.rollback();
        Logger.error('Exception occured while updating the order status after Refund Transaction' + e);
    }
}

/**
 * save transaction details in custom attribute
 * @param {Object} paymentInstrument - paymentInstrument
 * @param {number} amount - amount
 * @param {string} transactionID - transactionID
 * */
function saveCustomAttributes(paymentInstrument, amount, transactionID) {
    var currentTime = new Date().toJSON();
    var timestamp = currentTime.replace(/\.\d\d\dZ/, 'Z');
    var transactionStatus;
    var payInstrument = paymentInstrument;

    if (amount > 0) {
        transactionStatus = 'Partially Refunded';
    } else {
        transactionStatus = 'Refunded';
    }

    Transaction.begin();
    payInstrument.custom.hummTransactionID = transactionID;
    payInstrument.custom.hummPaidAmount = amount || 0.0;
    payInstrument.custom.hummTransactionStatus = transactionStatus;
    payInstrument.custom.hummTransactionDate = timestamp;
    Transaction.commit();
}

/**
 * save transaction details in settlehistory
 * @param {Object} paymentInstrument - paymentInstrument
 * @param {Object} settleHistory - settleHistory
 * @param {number} amount - amount
 * */
function saveHistory(paymentInstrument, settleHistory, amount) {
    var historyEntry = {
        id: paymentInstrument.custom.hummTransactionID,
        status: paymentInstrument.custom.hummTransactionStatus,
        amount: amount || '',
        date: paymentInstrument.custom.hummTransactionDate
    };
    var payInstrument = paymentInstrument;

    settleHistory.push(historyEntry);

    Transaction.begin();
    payInstrument.custom.hummSettleHistory = JSON.stringify(settleHistory);
    Transaction.commit();
}

/**
 * call action
 * @param {Object} request - request
 * @returns {Object} response - response
 * */
function callAction(request) {
    var refundService = require('~/cartridge/scripts/utils/ServiceUtils');
    var endpoint = configuration.hummRefundEndpoint;
    var response = refundService.serviceCall('POST', endpoint, JSON.stringify(request));

    return response;
}

/**
 * Refund action
 * @param {string} orderNo - orderNo
 * @param {number} amount - amount
 * @param {string} refundReason - refundReason
 * @returns {Object} status
 * */
function refund(orderNo, amount, refundReason) {
    var order = OrderMgr.getOrder(orderNo);
    var status = false;
    var response;
    var request;
    var settleHistory;
    var settleEntry;
    var transactionID;
    var error;
    var paymentInstrument = Utils.getPaymentInstrument(order);

    var newAmount = parseFloat(amount, 10);
    settleHistory = paymentInstrument.custom.hummSettleHistory || '[]';
    settleHistory = JSON.parse(settleHistory);

    if (settleHistory.length > 0) {
        settleEntry = settleHistory[settleHistory.length - 1];
        transactionID = settleEntry.id || '';
    }

    var merchantID = configuration.hummMerchantID;
    var signature = require('~/cartridge/scripts/RefundSignature').getSignature(merchantID, transactionID, newAmount, refundReason);

    request = {
        x_merchant_number: merchantID,
        x_purchase_number: transactionID,
        x_amount: newAmount,
        x_reason: refundReason,
        signature: signature
    };
    Logger.debug('Refund request: ' + JSON.stringify(request));
    response = callAction(request);
    Logger.debug('Refund Response: ' + JSON.stringify(response));

    if (response !== null && (response && response.httpStatus === '204')) {
        var paidAmount = paymentInstrument.custom.hummPaidAmount || 0.0;

        status = true;
        saveCustomAttributes(paymentInstrument, (paidAmount - newAmount).toFixed(2), transactionID);
        saveHistory(paymentInstrument, settleHistory, newAmount);
        Logger.debug('settle history in refund transaction : ' + paymentInstrument.custom.hummSettleHistory + paidAmount + newAmount);

        if (newAmount == paidAmount) {
            updateOrderStatus(orderNo);
        }
    } else if (response !== null && (response && (response.httpStatus === '400' || response.httpStatus === '401' || response.httpStatus === '0'))) {
        error = response.reasonDescription;
    } else {
        error = Resource.msg('transaction.unknown', 'humm', null);
    }

    return {
        status: status,
        error: error
    };
}

/**
 * Internal methods
 */
module.exports = {
    refund: function (orderNo, amount, refundReason) {
        return refund(orderNo, amount, refundReason);
    }
};
