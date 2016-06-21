module.exports = function(router, utils) {
	'use strict';
	//console.log('v1/endpoints.js about to load just dataModels');
	// all endpoints are initially setup here and then pasted down the stack
	require("./endpoints/system")(router, utils);
};