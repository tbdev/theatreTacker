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

	router.route('/v1/system/check/post')
		.post(function(req,res){
			var token = req.app.get('token');
			var AUTH_TOKEN = req.app.get('AUTH_TOKEN');
			var dataToLoad = JSON.parse(req.body);
			var data = {
				user: req.body.KEY
			}
			utils.firebase_Push( token, '/inputs/', AUTH_TOKEN, data).then(
				function(good){
					utils.sendResponse(req,res,'GOOD', true,false);
				},function(bad){
					utils.sendResponse(req,res,'BAD', true,false);
				}
			)

		});


	router.route('/v1/system/check/get')
		.get(function(req,res){
			var token = req.app.get('token');
			var AUTH_TOKEN = req.app.get('AUTH_TOKEN');
			console.log( token );
			console.log('req.body', req.body );

			utils.firebase_Push( token, '/inputs/', AUTH_TOKEN).then(
				function(good){
					utils.sendResponse(req,res,'GOOD', true,false);
				},function(bad){
					utils.sendResponse(req,res,'BAD', true,false);
				}
			)

		});

};
