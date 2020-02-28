'use strict';


module.exports = {
	Mac: function () {
        return {
        	HMAC_SHA_256: "HMAC_SHA_256",
        	digest: function(){
        		return "sha";
        	}
        };
    },
    Encoding: {
    	toHex: function(){
    		return "sha";
    	}
    }
};
