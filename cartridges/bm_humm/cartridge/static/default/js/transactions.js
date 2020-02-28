'use strict';
/* global $, jQuery, Resources, Urls */

(function ($) {
    var trans = {
        init: function () {
            if ($('.humm-module .operations-holder').length) {
                this.transOperationsEvents();
            }
        },
        transOperationsEvents: function () {
            $('.transaction-actions').on('click', function () {
                $('.operations-holder').toggle();

                return true;
            });
            $('.operations-holder button').on('click', function () {
                var button = $(this);
                var buttonLabel = button.text();
                var orderno = $('input[name=orderno]').val();
                var amount = parseFloat($('input[name=refundamount]').val(), 10);
                var maxRefundAmount = parseFloat($('input[name=maxrefundamount]').val(), 10);
                var reason = $('input[name=refundreason]').val();
                var url;
                var postData;

                if ($('input[name=refundamount]').val() === '' || amount <= 0.0) {
                    $('.operations-holder .error').text(Resources.INVALID_REFUND_AMOUNT);
                    return false;
                } else if (amount > maxRefundAmount) {
                    $('.operations-holder .error').text(Resources.MAXIMUM_REFUND_AMOUNT + maxRefundAmount);
                    return false;
                }

                if ($('input[name=refundreason]').val() === '') {
                    $('.operations-holder .error').text(Resources.EMPTY_REFUND_REASON);
                    return false;
                }

                $('.operations-holder .error').text('');
                url = Urls.operationActions;
                postData = {
                    orderno: orderno,
                    amount: amount,
                    reason: reason
                };

                button.prop('disabled', true);
                button.text(Resources.TRANSACTION_PROCESSING);

                $.post(url, postData, function (data) {
                    var result = data ? JSON.parse(data) : {};

                    button.prop('disabled', false);
                    button.text(buttonLabel);

                    if (result && result.status) {
                        alert(Resources.TRANSACTION_SUCCESS); // eslint-disable-line
                        window.location.reload();
                    } else {
                        alert(Resources.TRANSACTION_FAILED + result.error); // eslint-disable-line
                    }
                });

                return true;
            });
            $('.operations-holder input[name=refundamount]').on('keypress', function (e) {
                var code = e.which;
                var input = $(this);

                if (code === 46) {
                    if (input.val() === '') {
                        input.val('0.');
                        e.preventDefault();
                    } else if (input.val().indexOf('.') >= 0) {
                        e.preventDefault();
                    }
                } else if (code !== 0 && code !== 8 && (code < 48 || code > 57)) {
                    e.preventDefault();
                }
            }).on('blur', function () {
                var input = $(this);

                if (input.val() !== '') {
                    input.val(parseFloat(input.val(), 10));
                } else if (input.val().indexOf('.') === 0) {
                    input.val('0' + input.val());
                }
            });
        }
    };

    // initialize app
    $(document).ready(function () {
        trans.init();
    });
}(jQuery));
