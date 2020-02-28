'use strict';
var sitePreferences = require('*/cartridge/scripts/utils/hummUtils').getSitePreference();
var hummEnable = sitePreferences.hummEnabled;

var getHummPriceRangeForWidget = {};

/**
* retrieve widget related data
* @returns {string} - request JSON
*/
getHummPriceRangeForWidget.getWidgetData = function () {
    var hummPaymentWidgetType = sitePreferences.hummPaymentWidgetType;
    var hummWidgetURl = sitePreferences.hummWidgetURl;
    var minOrderTotal = sitePreferences.hummMinOrderTotal ? sitePreferences.hummMinOrderTotal : 0.0;
    var maxOrderTotal = sitePreferences.hummMaxOrderTotal;

    return {
        hummEnable: hummEnable,
        hummPaymentWidgetType: hummPaymentWidgetType,
        hummWidgetURl: hummWidgetURl,
        minOrderTotal: minOrderTotal,
        maxOrderTotal: maxOrderTotal
    };
};

getHummPriceRangeForWidget.getCheckoutWidgetData = function (currentBasket) {
    var orderGrandTotal = currentBasket.totalGrossPrice;
    var minOrderTotal = sitePreferences.hummMinOrderTotal ? sitePreferences.hummMinOrderTotal : 0.0;
    var maxOrderTotal = sitePreferences.hummMaxOrderTotal ? sitePreferences.hummMaxOrderTotal : orderGrandTotal;
    var showHummPaymentMethod = false;
    showHummPaymentMethod = (orderGrandTotal >= minOrderTotal && orderGrandTotal <= maxOrderTotal);

    return showHummPaymentMethod;
};

module.exports = getHummPriceRangeForWidget;
