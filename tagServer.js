var exec = require('child_process').exec;
var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');
var https = require('https');
var http = require('http');

var users = require('./users.json');
var config = require('./client_config.json');

//Needed for self-signed root CA's
if (config.useHTTPS) {
    require('ssl-root-cas')
	.inject()
	.addFile('./keys/private-root-ca.crt.pem');
}

//Configure https
var httpsOptions;

if (config.useHTTPS) {
    httpsOptions = {
	key: fs.readFileSync('./keys/server.key.pem'),
	cert: fs.readFileSync('./keys/server.crt.pem')
    }
}

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//Main page just to check things are working
app.get('/', function (req, res) {
  res.end("rfid server running")
})

//access here!
app.get('/:location/check', function (req, res) {
    //console.log(req.body)

    //Re-read groups file (maybe upgrade this to redis someday)
    groups = JSON.parse(fs.readFileSync('./groups.json'));
    var location = req.params.location
    var group = groups[location]
    
    var rfid = req.body.rfid;
    if (!users.hasOwnProperty(rfid)) {
	console.log("unrecognized tag: %s attempted to access %s at %s",
		    rfid, location, Date.now());
	return res.end(JSON.stringify({
	    authorized: false
	}));
    }
    if (users[rfid].access[group]) {
	console.log("%s accessed %s at %s",
		    users[rfid].name, location, Date.now());
	return res.end(JSON.stringify({
	    authorized: true
	}));
	//let them in
	exec(config.openDoorScript,[config.relays[location], function (error, stdout, stderr) {
	    console.log(stdout);
	});

    }
    console.log("unauthorized attempt by %s to %s at %s",
		users[rfid].name, location, Date.now())
    return res.end(JSON.stringify({
	authorized: false
    }));
});

//start listening!
if(config.usetHTTPS) {
    https.createServer(httpsOptions, app).listen(config.serverPort);
} else {
    http.createServer(app).listen(config.serverPort);
}
console.log('RFID Server Listening');
