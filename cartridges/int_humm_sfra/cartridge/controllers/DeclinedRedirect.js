/**
* Redirected to this controller if the payment status is 'failed'
*
* @module  controllers/DeclinedRedirect
*/

'use strict';

var server = require('server');

server.get(
    'Declined',
    server.middleware.https,
    function (req, res, next) {
        res.render('checkout/declinedredirect', {
            paymentStatus: req.querystring.paymentStatus
        });
        next();
    }
);

module.exports = server.exports();
