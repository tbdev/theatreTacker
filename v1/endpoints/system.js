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
			var dataToLoad = req.body;
			var data = {
				user: req.body.KEY
			}
			var badgeExist = false;
			var deviceExist = false;
			// WE NEED TO CHANGE THE FIREBASE URL SO THAT WE CAN POST THE DATA TO THE CORRECT LOCATION
			utils.getClientFirebase(AUTH_TOKEN, token).then(
				function(settings){
					//console.log('done settings ', settings);
					var fbClientToken = settings.fbToken;
					var fbClientRoot = settings.fbRootURL;
					var badgePath = '/'+settings.fbClientID+'/Badge/'+req.body.KEY;
					utils.doesBadgeExist(fbClientRoot, badgePath,fbClientToken).then(
						function(badge){
							badgeExist = badge.result;
							var devicePath = '/'+settings.fbClientID+'/Device/'+req.body.MAC;
							utils.doesDeviceExist(fbClientRoot,devicePath,fbClientToken).then(
								function(device){
									deviceExist = device.result;
									console.log('badge ',badge);
									console.log('device ',device);
									console.log('badgeExist ', badgeExist );
									console.log( 'deviceExist ,', deviceExist );
									var dataLoadURL = '/'+settings.fbClientID+'/data/Device/'+req.body.MAC;
									var alertPath = '/'+settings.fbClientID+'/alerts/Device/'+req.body.MAC;
									var promises = [];
									if( !deviceExist ){
										console.log('here');
										utils.firebase_Set(fbClientRoot,'/'+settings.fbClientID+'/alerts/Device/'+req.body.MAC+'/',fbClientToken,{MAC: req.body.MAC}).then(
											function(){
												console.log('device alert write 1 done');
												if( !badgeExist ){
													utils.firebase_Set(fbClientRoot,'/'+settings.fbClientID+'/alerts/Badge/'+req.body.KEY,fbClientToken,{UID: req.body.KEY}).then(
														function(){
															console.log('badge alert write 1 done');
															// write the data
															utils.firebase_Push( fbClientRoot, dataLoadURL, fbClientToken, dataToLoad).then(
																function(good){
																	utils.sendResponse(req,res,'GOOD', true,false);
																},function(bad){
																	utils.sendResponse(req,res,'BAD', true,false);
																}
															)
														}
													);
												} else {
													// write the data
													console.log('write data write 1 done');
													utils.firebase_Push( fbClientRoot, dataLoadURL, fbClientToken, dataToLoad).then(
														function(good){
															utils.sendResponse(req,res,'GOOD', true,false);
														},function(bad){
															utils.sendResponse(req,res,'BAD', true,false);
														}
													)
												}
											}
										);
									} else if( !badgeExist ){
										utils.firebase_Set(fbClientRoot,'/'+settings.fbClientID+'/alerts/Badge/'+req.body.KEY,fbClientToken,{UID: req.body.KEY}).then(
											function(){
												console.log('badge alert write 2 done');
												// write the data
												utils.firebase_Push( fbClientRoot, dataLoadURL, fbClientToken, dataToLoad).then(
													function(good){
														utils.sendResponse(req,res,'GOOD', true,false);
													},function(bad){
														utils.sendResponse(req,res,'BAD', true,false);
													}
												)
											}
										);
									} else {
										// write the data
										console.log('write data write 2 done');
										utils.firebase_Push( fbClientRoot, dataLoadURL, fbClientToken, dataToLoad).then(
											function(good){
												utils.sendResponse(req,res,'GOOD', true,false);
											},function(bad){
												utils.sendResponse(req,res,'BAD', true,false);
											}
										)

									}


								}
							);
						}
					);


				}
			);

			/*
			// FIRST WE NEED TO CHECK FOR THE EXISTENCE OF THE DEVICE
			utils.doesBadgeExist( token, AUTH_TOKEN ).then(
				function(badgeResult){
					badgeExist = true;

					utils.doesDeviceExist( token, AUTH_TOKEN ).then(
						function(badgeResult){
							badgeExist = true;
						}
					);

				}
			);
			utils.firebase_Push( token, '/inputs/', AUTH_TOKEN, dataToLoad).then(
				function(good){
					utils.sendResponse(req,res,'GOOD', true,false);
				},function(bad){
					utils.sendResponse(req,res,'BAD', true,false);
				}
			)
			*/

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

	router.route('/v1/system/getConfig/:ID')
		.get(function(req,res){

			utils.sendResponse(req,res,{key:'123'}, true,false);
			
		});


};
