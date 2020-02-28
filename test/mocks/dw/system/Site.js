'use strict';

module.exports = {
    getCurrent: function () {
        return {
            getCustomPreferenceValue: function () {
                return true;
            },
            getID: function(){
            	return "site_id";
            }
        };
    }
};
