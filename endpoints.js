module.exports = function(router, utils) {
	'use strict';
	//console.log('from ./endpoints.js we are about to ./v1/endpoints.js')
	// all endpoints are initially setup here and then pasted down the stack
	require("./v1/endpoints.js")(router, utils);
};