'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var URLUtils = require('../../../../../mocks/dw.web.URLUtils.js');
var Logger = require('../../../../../mocks/dw/system/Logger.js');
var Site = require('../../../../../mocks/dw/system/Site.js');
var Resource = require('../../../../../mocks/dw/web/Resource.js');
var Crypto = require('../../../../../mocks/dw.crypto.js');

var HummLogUtils = proxyquire('../../../../../../cartridges/int_humm_core/cartridge/scripts/utils/hummLogUtils', {
	'dw/system/Logger': Logger
});

var order = {
	orderNo: "order123",
	getOrderToken: function(){
		return "order token";
	},
	getBillingAddress: function(){
		return {
			getCountryCode: function(){
				return "country code";
			}
		};
	},
	getTotalGrossPrice: function(){
		return {
			toNumberString: function(){
				return "0.0";
			}
		};
	},
	getCurrencyCode: function(){
		return "currency code";
	},
	customerEmail: "email@test.com"
};

describe('signature generation', function () {
	var signatureGeneration = proxyquire('../../../../../../cartridges/int_humm_core/cartridge/scripts/checkout/signatureGeneration', {
        'dw/util': {
        	SortedMap: function () {
        		var result = [];
                return {
                	put: function (key, context) {
                        result[key] = context;
                    },
                    keySet: function(){
                    	return {
                    		iterator: function(){
                    			var i = 0;
                    	        return {
                    	            hasNext: function () {
                    	                return i < result.length;
                    	            },
                    	            next: function () {
                    	                return result[i++];
                    	            }
                    	        };
                    		}
                    	}
                    }
                };
            }
        },
        'dw/web': {
        	URLUtils: URLUtils
        },
        'dw/crypto': Crypto,
        'dw/system/Site': Site,
        '~/cartridge/scripts/utils/hummLogUtils': HummLogUtils,
        '~/cartridge/scripts/utils/hummUtils': proxyquire('../../../../../../cartridges/int_humm_core/cartridge/scripts/utils/hummUtils', {
        	'~/cartridge/scripts/utils/hummLogUtils': HummLogUtils,
        	'dw/system/Site': Site
        })
    });
	
	describe('getSignature', function () {
		it('Should generate signature for redirecting to payment page', function () {
			var signature = signatureGeneration.getSignature(order);
			assert.equal(signature, 'sha');
		});
	});
});
