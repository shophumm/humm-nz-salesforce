'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');

/**
 *  Handle Ajax payment (and billing) form submit
 */
server.get('GetUpdatedWidget',
    server.middleware.https,
    function (req, res, next) {
        var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
        var updatedTemplate = 'util/hummpaymentwidget';
        var productID = req.querystring.productID;
        var productObject = ProductMgr.getProduct(productID);
        var totalPrice = productObject.priceModel.price.available ? productObject.priceModel.price.decimalValue : 0.0;
        var widgetData = require('*/cartridge/scripts/util/getHummPriceRangeForWidget').getWidgetData();
        var priceContext = {
            hummenable: widgetData.hummEnable,
            productid: productID,
            minordertotal: widgetData.minOrderTotal,
            maxordertotal: widgetData.maxOrderTotal,
            hummwidgeturl: widgetData.hummWidgetURl,
            hummpaymentwidgettype: widgetData.hummPaymentWidgetType,
            hummprice: totalPrice
        };

        var updatedWidget = renderTemplateHelper.getRenderedHtml(
            priceContext,
            updatedTemplate
        );
        res.json({
            error: false,
            updatedWidget: updatedWidget
        });
        next();
    });

module.exports = server.exports();
