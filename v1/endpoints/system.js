var express = require('express');
var deferred = require('deferred');
var request=require("request"); 

module.exports = function(router, utils) {
	'use strict';
	//console.log('systemCheck endpoints loading');
	router.route('/v1/system/random')
		.get(function(req,res){
			res.json( Math.random() );
		});

	router.route('/v1/system/check')
		.get(function(req,res){
			var token = req.app.get('token');
			console.log( token );
			utils.firebase_Push( token, '/inputs/').then(
				function(good){
					utils.sendResponse(req,res,'GOOD', true,false);
				},function(bad){
					utils.sendResponse(req,res,'BAD', true,false);
				}
			)

		});

};
