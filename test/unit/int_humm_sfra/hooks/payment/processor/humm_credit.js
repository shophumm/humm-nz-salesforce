'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var ArrayList = require('../../../../../mocks/dw.util.Collection.js');

var mockOptions = [{
    optionId: 'option 1',
    selectedValueId: '123'
}];

var availabilityModelMock = {
    inventoryRecord: {
        ATS: {
            value: 3
        }
    }
};

var productLineItemMock = {
    productID: 'someProductID',
    quantity: {
        value: 1
    },
    setQuantityValue: function () {
        return;
    },
    quantityValue: 1,
    product: {
        availabilityModel: availabilityModelMock
    },
    optionProductLineItems: new ArrayList(mockOptions),
    bundledProductLineItems: new ArrayList([])
};

var stubGetBonusLineItems = function () {
    var bonusProducts = [{
        ID: 'pid_1'
    },
    {
        ID: 'pid_2'
    }];
    var index2 = 0;
    var bonusDiscountLineItems = [
        {
            name: 'name1',
            ID: 'ID1',
            description: 'description 1',
            UUID: 'uuid_string',
            maxBonusItems: 1,
            bonusProducts: {
                iterator: function () {
                    return {
                        items: bonusProducts,
                        hasNext: function () {
                            return index2 < bonusProducts.length;
                        },
                        next: function () {
                            return bonusProducts[index2++];
                        }
                    };
                }
            }
        }
    ];
    var index = 0;

    return {
        id: 2,
        name: '',
        iterator: function () {
            return {
                items: bonusDiscountLineItems,
                hasNext: function () {
                    return index < bonusDiscountLineItems.length;
                },
                next: function () {
                    return bonusDiscountLineItems[index++];
                }
            };
        }
    };
};

var createApiBasket = function (productInBasket) {
    var currentBasket = {
        defaultShipment: {},
        createProductLineItem: function () {
            return {
                setQuantityValue: function () {
                    return;
                }
            };
        },
        getBonusDiscountLineItems: stubGetBonusLineItems,
        getPaymentInstruments: function(){
        	return new ArrayList([]);
        },
        createPaymentInstrument: function(){
        	return {};
        },
        removePaymentInstrument: function(){
        	return;
        }
    };
    if (productInBasket) {
        currentBasket.productLineItems = new ArrayList([productLineItemMock]);
    } else {
        currentBasket.productLineItems = new ArrayList([]);
    }

    return currentBasket;
};

describe('humm credit', function () {
	var hummCredit = proxyquire('../../../../../../cartridges/int_humm_sfra/cartridge/scripts/hooks/payment/processor/humm_credit', {
		'*/cartridge/scripts/util/collections': proxyquire('../../../../../../../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/scripts/util/collections', {
            'dw/util/ArrayList': ArrayList
        }),
        'dw/system/Transaction': {
            wrap: function (item) {
                item();
            }
        }
    });
	describe('Handle', function () {
		it('Should create payment instrument for Humm on basket', function () {
			var currentBasket = createApiBasket(false);
			var result = hummCredit.Handle(currentBasket);
			
			assert.isFalse(result.error);
			assert.deepEqual(result.fieldErrors, {});
		});
	});
	describe('Authorize', function () {
		it('Should authorize Humm payment', function () {
			var result = hummCredit.Authorize();
			
			assert.isFalse(result.error);
			assert.deepEqual(result.fieldErrors, {});
		});
	});
});