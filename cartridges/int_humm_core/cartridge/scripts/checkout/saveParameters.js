/* API includes */
var Transaction = require('dw/system/Transaction');
var Order = require('dw/order/Order');

/**
* Save parameters in custom attributes of PaymentTransaction system object.
* @param {Object} order - order
* @param {Object} paymentInstrument - paymentInstrument
* @param {Object} paymentProcessor - paymentProcessor
* @param {Object} request - request
*/
function saveParameters(order, paymentInstrument, paymentProcessor, request) {
    var hummTransactionID = request.x_gateway_reference.stringValue ? request.x_gateway_reference.stringValue : request.x_gateway_reference;
    var paymentStatus = request.x_result.stringValue ? request.x_result.stringValue : request.x_result;
    var timeStamp = request.x_timestamp.stringValue ? request.x_timestamp.stringValue : request.x_timestamp;
    var xAmount = request.x_amount.stringValue ? request.x_amount.stringValue : request.x_amount;
    var paidAmount = paymentStatus === 'completed' ? xAmount : 0.0;
    var payInstrument = paymentInstrument;
    var localOrder = order;

    Transaction.begin();

    payInstrument.paymentTransaction.paymentProcessor = paymentProcessor;
    payInstrument.paymentTransaction.transactionID = order.orderNo;
    localOrder.custom.isHummOrder = true;

    if (paymentStatus === 'completed') {
        localOrder.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
    }

    payInstrument.custom.hummTransactionID = hummTransactionID;
    payInstrument.custom.hummPaidAmount = paidAmount;
    payInstrument.custom.hummTransactionStatus = paymentStatus;
    payInstrument.custom.hummTransactionDate = timeStamp;

    var settleHistory = [];
    var historyEntry = {
        id: hummTransactionID,
        amount: paidAmount,
        status: paymentStatus,
        date: timeStamp
    };
    settleHistory.push(historyEntry);
    payInstrument.custom.hummSettleHistory = JSON.stringify(settleHistory);
    Transaction.commit();
}

module.exports = {
    saveCustomAttributes: function (order, paymentInstrument, paymentProcessor, request) {
        return saveParameters(order, paymentInstrument, paymentProcessor, request);
    }
};
