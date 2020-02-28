var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('HummWidget-GetUpdatedWidget', function () {
    this.timeout(25000);

    var myRequest = {
        url: '',
        method: 'GET',
        resolveWithFullResponse: true
    };

    myRequest.url = config.baseUrl + '/HummWidget-GetUpdatedWidget?productID=25696630M';

    it('should successfully return Humm widget HTML', function () {
        request(myRequest, function (error, response) {
        	assert.equal(response.statusCode, 200, 'Expected get updated widget request statusCode to be 200.');
        	
        	var bodyAsJson = JSON.parse(response.body);

            assert.isFalse(bodyAsJson.error);
        });
    });
});
