'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var order = {
	orderNo: "abcd",
	custom: {
		isHummOrder: true
	},
	setPaymentStatus: function(){
		return;
	}
};

var paymentInstrument = {
	paymentTransaction: {
		paymentProcessor: {},
		transactionID: "abcd"
	},
	custom: {
		hummTransactionID: "SomeTransactionID",
		hummPaidAmount: 0.0,
		hummTransactionStatus: "TransactionStatus",
		hummTransactionDate: 1234567890,
		hummSettleHistory: "Some History"
	}
}

var paymentProcessor = {};

var request = {
	x_gateway_reference: "x_gateway_reference",
	x_result: "x_result",
	x_timestamp: "x_timestamp",
	x_amount: 0.0
};

describe('save parameters', function () {
	var saveParameters = proxyquire('../../../../../../cartridges/int_humm_core/cartridge/scripts/checkout/saveParameters', {
        'dw/system/Transaction': {
            begin: function () {
                return;
            },
            commit: function () {
                return;
            }
        },
        'dw/order/Order': {
        	PAYMENT_STATUS_PAID: 2
        }
    });
	
	describe('saveCustomAttributes', function () {
		it('Should save parameters in custom attributes of PaymentTransaction System Object', function () {
			saveParameters.saveCustomAttributes(order, paymentInstrument, paymentProcessor, request);
		});
	});
});
