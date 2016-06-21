var throng = require('throng');
if (process.env.hasOwnProperty("TT_AUTH_TOKEN")) {
	AUTH_TOKEN = process.env.TT_AUTH_TOKEN;
} else {
	//console.log("Firebase Token Not Configured in Environment. Terminating process.");
	process.exit(1);
}

//console.log('WEB_CONCURRENCY ', process.env.WEB_CONCURRENCY);
//var WORKERS = process.env.WEB_CONCURRENCY || 1;
var WORKERS = 5; // hard code the number of workers
var PORT = process.env.PORT || 8888;

throng(start, {
	workers: WORKERS,
	lifetime: Infinity
});

function start() {
	// call the packages we need
	var express			= require('express');        // call express
	var app				= express();                 // define our app using express
	var bodyParser		= require('body-parser');
	var deferred		= require('deferred');
	var utils			= require('./utils');
	var compression 	= require('compression');

	app.set('view cache', true);
/*
	if( typeof process.env.NODE_ENV != 'undefined' && process.env.NODE_ENV == 'production'){
		app.use(function(req, res, next) {
			if( req.headers['x-forwarded-proto'] != 'https') {
				res.redirect('https://' + req.get('Host') + req.url);
			} else {
				next();
			}
		});
	}
*/
	app.use(compression());
	// configure app to use bodyParser()
	// this will let us get the data from a POST
	app.use(bodyParser.json({limit: '5mb'}));
	app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));

	var port = process.env.PORT || 9000;        // set our port

	// ROUTES FOR OUR API
	// =============================================================================
	var router = express.Router();              // get an instance of the express Router

	// middleware to use for all requests
	router.use(function(req, res, next) {
		if (req.originalUrl === '/favicon.ico') {
			res.writeHead(200, {'Content-Type': 'image/x-icon'} );
			res.end(/* icon content here */);
		} else {
			var rootRefOnly = false;
			if(req.body){
				rootRefOnly = req.body.legalVersions;
			}
			//set the user token
			var clientToken = req.baseUrl.split('/')[1];
			app.set('token', clientToken);
			app.set('AUTH_TOKEN', AUTH_TOKEN);
			if( clientToken != 'appOnly'){
				require("./endpoints")(router, utils);
				next();
			}
		}
	});

	// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
	router.get('/', function(req, res) {
	    res.json({ message: 'UNAUTHORIZED' });
	});

	// more routes for our API will happen here

	// REGISTER OUR ROUTES -------------------------------
	// all of our routes will be prefixed with /api
	app.use('/:token', router);
	// added to handle root requests
	app.use('/', router);

	// START THE SERVER
	// =============================================================================
	//app.listen(port);
	app.listen(PORT, onListen);

	function onListen() {
		console.log(1,"Starting Process Listening on "+PORT);
	}

}