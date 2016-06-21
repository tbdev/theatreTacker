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

exports.firebase_Push = function(token,url,authToken,data ){
	var d = deferred();
	var https = require('https');

	if( typeof data == 'undefined'){
		d.reject();
	} else {

		data.lastModified = (new Date()).getTime();
		// request option
		var options = {
			host: 'theatretracker.firebaseio.com',
			port: 443,
			path: '/customers/'+token+'/data'+url+".json?auth="+authToken,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}
		};

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
exports.firebase_Set = function(token,url,path ){

};
exports.firebase_Delete = function(token,url,path ){

};
exports.firebase_Update = function(token,url,path ){

};
exports.isMaverick = function(token,url,customerID, path){
	var d = deferred();
	path = '/customers/'+customerID+'/application/'+path;
	var self = this;
	var typePath = '/customers/'+customerID+'/application/dataItems/models/GatewayType/data';
	this.RESTFirebase(token,url,typePath).then(
		function(types){
			self.RESTFirebase(token,url,path).then(
				function(data){
					if( Object.keys(data.data).length === 0 ){
						d.reject();
					} else {
						if( types.data[data.data.GatewayType].Name == 'Maverick'){
							d.resolve(true);
						} else {
							d.resovle(false);
						}
					}
				}
			);
		}
	);
	return d.promise;
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
