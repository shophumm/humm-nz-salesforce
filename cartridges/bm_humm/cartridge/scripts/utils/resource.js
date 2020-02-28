/**
 * Resource helper
 *
 */

var ResourceHelper = {};

/**
 * Get the client-side resources of a given page
 * @returns {Object} An objects key key-value pairs holding the resources
 */
ResourceHelper.getResources = function () {
    var Resource = require('dw/web/Resource');

    // application resources
    var resources = {
        // Transaction operation messages
        TRANSACTION_SUCCESS: Resource.msg('transaction.success', 'humm', null),
        TRANSACTION_FAILED: Resource.msg('transaction.failed', 'humm', null),
        TRANSACTION_PROCESSING: Resource.msg('operations.wait', 'humm', null),
        INVALID_REFUND_AMOUNT: Resource.msg('refund.amount.validation', 'humm', null),
        MAXIMUM_REFUND_AMOUNT: Resource.msg('maximum.refund.amount', 'humm', null),
        EMPTY_REFUND_REASON: Resource.msg('empty.refund.reason', 'humm', null)
    };
    return resources;
};

/**
 * Get the client-side URLs of a given page
 * @returns {Object} An objects key key-value pairs holding the URLs
 */
ResourceHelper.getUrls = function () {
    var URLUtils = require('dw/web/URLUtils');
    // application urls
    var urls = {
        operationActions: URLUtils.url('Operations-Action').toString()
    };

    return urls;
};

module.exports = ResourceHelper;
