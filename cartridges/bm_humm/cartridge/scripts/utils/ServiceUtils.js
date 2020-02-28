/*
*    Service call for communication between Demandware cartridge and humm REST API
*/
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Resource = require('dw/web/Resource');

// Lib Includes
var hummUtils = require('*/cartridge/scripts/utils/hummUtils');
var LogUtils = require('*/cartridge/scripts/utils/hummLogUtils');

// Global Variables
var Utils = {};
var Logger = LogUtils.getLogger('ServiceUtils');

/*
*    Communicates with Humm API
*/
Utils.serviceCall = function (method, endPoint, request) {
    var endPointUrl = endPoint;
    var serviceArgs;
    var localService;
    var newRequest;
    var errorObject;

    localService = LocalServiceRegistry.createService('humm.http', {
        createRequest: function (service, args) {
            service.setURL(args.endPointUrl);
            service.setRequestMethod(args.method);
            service.addHeader('Content-Type', 'application/json');

            return args.request;
        },
        parseResponse: Utils.serviceParseResponse,
        getRequestLogMessage: function (paramRequest) {
            return hummUtils.getFilteredLogMessage(paramRequest);
        },
        getResponseLogMessage: function (response) {
            return response;
        }
    });

    newRequest = request || '';

    serviceArgs = {
        method: method,
        endPointUrl: endPointUrl,
        request: newRequest
    };

    var result = localService.call(serviceArgs);

    if (result.status !== 'OK') {
        errorObject = Utils.getErrorResponses(result);

        Logger.error('Error on service execution: ' + result.errorMessage);
    }

    return result.status === 'OK' ? result.object : errorObject;
};

/*
*    HTTPService configuration parseResponse
*/
Utils.serviceParseResponse = function (service, httpClient) {
    var resp;

    if (httpClient.statusCode === 200 || httpClient.statusCode === 201) {
        resp = JSON.parse(httpClient.getText());
    } else if (httpClient.statusCode === 204) {
        resp = { httpStatus: '204', reasonCode: 'none', reasonDescription: 'success' };
    } else {
        Logger.error('Error on http request: ' + httpClient.getErrorText());
        resp = null;
    }

    return resp;
};

/*
*    Get Error Response
*/
Utils.getErrorResponses = function (result) {
    var errorMessage = result.errorMessage ? result.errorMessage : 'none';
    var statusCode = result.error;
    var reasonDescription = '';

    if (statusCode === '400') {
        errorMessage = JSON.parse(result.errorMessage);

        if (errorMessage.Message === 'MERR0001') {
            reasonDescription = Resource.msg('refundapi.error.MERR0001', 'humm', null);
        } else if (errorMessage.Message === 'MERR0003') {
            reasonDescription = Resource.msg('refundapi.error.MERR0003', 'humm', null);
        } else if (errorMessage.Message === 'MERR0004') {
            reasonDescription = Resource.msg('refundapi.error.MERR0004', 'humm', null);
        }
    } else if (statusCode === '401') {
        reasonDescription = Resource.msg('refundapi.error.401', 'humm', null);
    } else if (statusCode === '0') {
        reasonDescription = result.errorMessage;
    }

    var errorObject = {
        httpStatus: statusCode,
        reasonDescription: reasonDescription
    };

    return errorObject;
};

module.exports = Utils;
