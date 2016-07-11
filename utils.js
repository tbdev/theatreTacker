var json2xml = require('json2xml');
var deferred = require('deferred');

exports.sendResponse = function(req,res,data, sendText, sendCSV){
	if( typeof sendText !== 'undefined' && sendText === true) {
		res.send(data);
	} else if( typeof sendCSV !== 'undefined' && sendCSV == true){
		res.set('Content-Type', 'text/csv');
		res.send( data );
	} else {
		if (req.query.RT && req.query.RT.toUpperCase() == 'XML') {
			res.set('Content-Type', 'text/xml');
			res.send( jsonToXML(data) );
		} else {
			res.json( data );
		}
	}
	try {
		global.gc();
	} catch (e) {
		console.log("You must run program with 'node --expose-gc server.js'");
	}
};

function jsonToXML(data) {
	var xml = json2xml({ Omniboard: data });
	return xml;
};

exports.doesBadgeExist = function( URL,PATH,TOKEN ){

	var d = deferred();
	var self = this;

	self.RESTFirebase( TOKEN, URL, PATH , false).then(
		function(badgeResults){
			if( Object.keys(badgeResults.data).length === 0){
				d.resolve({result:false,data:badgeResults.data});
			} else {
				d.resolve({result:true,data:badgeResults.data});
			}
		}
	);
	return d.promise;
};

exports.doesDeviceExist = function( URL,PATH,TOKEN ){
	var d = deferred();
	var self = this;

	self.RESTFirebase( TOKEN, URL, PATH , false).then(
		function(badgeResults){
			if( Object.keys(badgeResults.data).length === 0){
				d.resolve( {result:false,data:badgeResults.data} );
			} else {
				d.resolve( {result:true,data:badgeResults.data} );
			}
			d.resolve(badgeResults );
		}
	);
	return d.promise;
};


exports.getClientFirebase = function(AUTH_TOKEN, token){
	var d = deferred();
	var self = this;
	var url = 'https://theatretracker.firebaseio.com';
	var path = '/customers/'+token+'/';

	self.RESTFirebase( AUTH_TOKEN, url,path,false ).then(
		function(settings){
			d.resolve(settings.data);
		}
	);
	return d.promise;
};

exports.RESTFirebase = function(token,url,path, shallow){
	var d = deferred();

	var https = require("https");

	var options = {
		host: url.split('//')[1],
		port: 443,
		path: path+'.json?auth='+token,
		method: 'GET'
	};

	if( typeof shallow != 'undefined' && shallow == true){
		options.path = options.path+'&shallow=true';
	}

	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		var data = '';
		res.on('data', function (chunk) {
			data = data + chunk;
		});
		res.on('end', function () {

			var finalData = JSON.stringify( data );
			if( data == "null" ){
				data = {};	
			} else {
				data = JSON.parse( data );
			}
			var cleanPath = path.split('/application')[1];
			d.resolve( {data: data, url:cleanPath } );
		});
		res.on('error', function () {
			console.log('error ');
		});
	});
	req.end();

	req.on('error', function(e) {
		console.error(e);
		d.reject( {error: {} } );
	});
	return d.promise;

};

exports.firebase_Push = function(url,path,token,data ){
	console.log('firebase_Push');
	console.log( url );
	console.log( path );
	console.log( token );
	console.log( data );
	var d = deferred();
	var https = require('https');

	if( typeof data == 'undefined'){
		d.reject();
	} else {

		data.lastUpdated = (new Date()).getTime();
		console.log('added lastModified');
		// request option
		var options = {
			//host: 'theatretracker.firebaseio.com',
			host: url.split('//')[1],
			port: 443,
			//path: '/customers/'+token+'/data'+url+".json?auth="+authToken,
			path: path+".json?auth="+token,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}
		};

		console.log( options );
		var req = https.request(options, function(res) {
			console.log('Status: ' + res.statusCode);
			console.log('Headers: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', function (body) {
				console.log('Body: ' + body);
				d.resolve();
			});
		});
		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
			d.reject();
		});
		// write data to request body
		req.write( JSON.stringify(data) );
		req.end();
	}

	return d.promise;
};
exports.firebase_Set = function(url,path,token,data ){
	var d = deferred();
	var https = require('https');

	if( typeof data == 'undefined'){
		d.reject();
	} else {

		data.lastUpdated = (new Date()).getTime();
		// request option
		var options = {
			host: url.split('//')[1],
			port: 443,
			path: path+".json?auth="+token,
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			}
		};

		var req = https.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (body) {
				console.log('Body: ' + body);
				d.resolve();
			});
		});
		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
			d.reject();
		});
		// write data to request body
		req.write( JSON.stringify(data) );
		req.end();
	}

	return d.promise;
};
exports.firebase_Delete = function(token,url,path ){

};
exports.firebase_Update = function(token,url,path ){

};
exports.reindexArray = function(object){
	var data = [];
	for(var key in object){
		data.push( object[key] );
	}
	return data;
};
exports.createTime = function(){
	var timeUpdated = new Date();
	var month = timeUpdated.getMonth() + 1;
	var day = timeUpdated.getDate() + 1;
	month = (month.toString().length == 1) ? "0"+month : month;
	day = (day.toString().length == 1) ? "0"+day : day;
	var hr = timeUpdated.getHours();
	hr = (hr.toString().length == 1) ? "0"+hr : hr;
	var mn = timeUpdated.getMinutes();
	mn = (mn.toString().length == 1) ? "0"+mn : mn;
	var fullTime = month +'-'+ day +'-'+ timeUpdated.getFullYear() +" "+hr+":"+mn;
	return fullTime;
}
