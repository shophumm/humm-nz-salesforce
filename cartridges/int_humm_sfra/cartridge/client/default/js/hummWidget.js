'use strict';

/* global $ */

/**
 * Gets Widget HTML from Humm API
 */
function getWidget() {
    var productID = $('.product-id').text();
    var productContainer = $('.product-detail');
    var getUpdatedWidgetUrl = $('.updated-widget').val();
    var queryString = '?productID=' + productID;

    $.ajax({
        url: getUpdatedWidgetUrl + queryString,
        method: 'GET',
        success: function (data) {
            if (data.updatedWidget) {
                if (productContainer !== undefined) {
                    productContainer.find('.humm-widget').html(data.updatedWidget);
                    productContainer.find('.humm-widget').show();
                } else if (productContainer === undefined) {
                    $('.humm-widget').html(data.updatedWidget);
                    $('.humm-widget').show();
                }
            }
        }
    });
}

$(document).ready(function () {
    $('.product-detail .attribute button').on('click', function () {
        getWidget();
    });

    $('.product-detail .attribute select').on('change', function () {
        getWidget();
    });
});
