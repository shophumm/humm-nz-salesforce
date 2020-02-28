/**
* Gets order list
*/

// API Includes
var OrderMgr = require('dw/order/OrderMgr');
var ArrayList = require('dw/util/ArrayList');

/**
 * getOrders
 * @param {Object} input - input parameters
 * @returns {Object} output
 * */
function getOrders(input) {
    var pageSize = input.pageSize;
    var pageNumber = input.pageNumber;
    var orderNumber = input.orderNumber;
    var result = new ArrayList();
    var totalOrderCount;
    var orders;
    var order;
    var rowCount;
    var pageCount;
    var startRow;
    var endRow;

    totalOrderCount = startRow = endRow = rowCount = pageCount = 0;

    if (orderNumber) { // searching for an order ID
        order = OrderMgr.searchOrder('orderNo = {0} AND custom.isHummOrder = {1}', orderNumber, true);
        if (order) {
            result.push(order);
            totalOrderCount = startRow = endRow = 1;
        }
    } else { // all orders on pagination
        orders = OrderMgr.searchOrders('custom.isHummOrder = {0}', 'creationDate desc', true);
        orders.forward((pageNumber - 1) * pageSize, pageSize);

        while (orders.hasNext()) {
            result.push(orders.next());
            rowCount++;
        }

        totalOrderCount = orders.count;
        startRow = ((pageNumber - 1) * pageSize) + 1;
        endRow = startRow + rowCount;
        endRow--;
        pageCount = Math.ceil(totalOrderCount / pageSize);
    }

    return {
        orders: result,
        totalOrderCount: totalOrderCount,
        startRow: startRow,
        endRow: endRow,
        pageSize: pageSize,
        pageNumber: pageNumber,
        pageCount: pageCount,
        orderNumber: orderNumber
    };
}

module.exports = {
    output: function (input) {
        return getOrders(input);
    }
};
