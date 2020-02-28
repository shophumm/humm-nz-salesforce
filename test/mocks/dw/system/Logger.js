'use strict';

module.exports = {
    debug: function (text) {
        return text;
    },
    error: function (text) {
        return text;
    },
    getLogger: function () {
        return this;
    }
};
