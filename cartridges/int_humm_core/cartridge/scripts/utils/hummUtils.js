/*
*    Utility functions for the cartridge
*/

var Site = require('dw/system/Site');

// Lib Includes
var LogUtils = require('~/cartridge/scripts/utils/hummLogUtils');

// Global Variables
var Logger = LogUtils.getLogger('Utils');

var hummUtils = {
    /**
     * Get humm configuration values from Business Manager
     * @returns {Object} configuration
     */
    getSitePreference: function () {
        var hummEnabled = Site.getCurrent().getCustomPreferenceValue('isHummEnabled');
        var hummMerchantID = Site.getCurrent().getCustomPreferenceValue('hummMerchantID') || '';
        var hummGatewayKey = Site.getCurrent().getCustomPreferenceValue('hummGatewayKey') || '';
        var hummGatewayURL = Site.getCurrent().getCustomPreferenceValue('hummGatewayURL') || '';
        var hummRefundEndpoint = Site.getCurrent().getCustomPreferenceValue('hummRefundEndpoint') || '';
        var hummMinOrderTotal = Site.getCurrent().getCustomPreferenceValue('hummMinOrderTotal');
        var hummMaxOrderTotal = Site.getCurrent().getCustomPreferenceValue('hummMaxOrderTotal');
        var hummWidgetURl = Site.getCurrent().getCustomPreferenceValue('hummWidgetURL') || '';
        var hummPaymentWidgetType = Site.getCurrent().getCustomPreferenceValue('hummPaymentWidgetType').value || 'both';
        var hummAPICallbackEnable = Site.getCurrent().getCustomPreferenceValue('isEnableHummAPICallback');

        if (hummMerchantID === '' || hummGatewayKey === '' || hummGatewayURL === '' || hummRefundEndpoint === '') {
            Logger.error('Error: Humm Business Manager configurations are missing.');
        }

        var config = {
            hummEnabled: hummEnabled,
            hummMerchantID: hummMerchantID,
            hummGatewayKey: hummGatewayKey,
            hummGatewayURL: hummGatewayURL,
            hummRefundEndpoint: hummRefundEndpoint,
            hummMinOrderTotal: hummMinOrderTotal,
            hummMaxOrderTotal: hummMaxOrderTotal,
            hummWidgetURl: hummWidgetURl,
            hummPaymentWidgetType: hummPaymentWidgetType,
            hummAPICallbackEnable:hummAPICallbackEnable
        };

        return config;
    },

    /**
    * Get PaymentInstrument
    * @param {Object} requestParams - requestParams
    * @returns {Object} paymentInstrument
    */
    getPaymentInstrument: function (requestParams) {
        var hummPaymentInstrument;
        var paymentInstrument;
        var iter = requestParams.getPaymentInstruments().iterator();

        while (iter.hasNext()) {
            hummPaymentInstrument = iter.next();

            if ((hummPaymentInstrument.paymentMethod).toLowerCase() === 'humm') {
                paymentInstrument = hummPaymentInstrument;
            }
        }
        return paymentInstrument;
    },
    /**
    * Get PaymentMethod
    * @param {Object} requestParams - requestParams
    * @returns {Object} paymentmethod
    */
    getPaymentMethod: function (requestParams) {
        var paymentInstrument = this.getPaymentInstrument(requestParams);
        var paymentMethod = paymentInstrument.paymentMethod;
        return paymentMethod;
    },
    /**
    * filter sensitive data in log messages
    * @param {Object} requestParams - requestParams
    * @returns {string} jsonString
    */
    getFilteredLogMessage: function (requestParams) {
          var requestJSON = JSON.parse(requestParams);
          Logger.error('refund call back. {0} ',JSON.stringify(requestParams));
      
          if (requestJSON.signature) {
              requestJSON.signature = '***';
          }

         if (requestJSON.x_merchant_number) {
             requestJSON.x_merchant_number = '***';
         }
         return JSON.stringify(requestParams);
    }
};

module.exports = hummUtils;
