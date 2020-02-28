/*
*    Creates custom log file for the cartridge
*/

// API Includes
var Logger = require('dw/system/Logger');

// Global Variables
var defaultLogFilePrefix = 'humm';

var LoggerUtils = {};

LoggerUtils.getLogger = function (category) {
    if (category) {
        return Logger.getLogger(defaultLogFilePrefix, category);
    }

    return Logger.getLogger(defaultLogFilePrefix);
};

module.exports = LoggerUtils;
