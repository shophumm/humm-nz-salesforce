'use strict';
/* global empty */

var server = require('server');

var Product = module.superModule;
server.extend(Product);


/**
* appends Product-Show method to show humm widget
*/
server.append('Show', function (req, res, next) {
    var widgetData = require('*/cartridge/scripts/util/getHummPriceRangeForWidget').getWidgetData();
    res.setViewData(widgetData);
    next();
});

module.exports = server.exports();
