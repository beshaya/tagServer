var https = require('https');
var http = require('http');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs')

var config = require('./client_config')

//listen to a binary script for id's, then send them to the server
//the server will respond authorized or not
//if authorized, call the binary script to let them in

var mylocation = config.location

var options = {
    hostname: config.serverIP,
    port: config.serverPort,
    path: '/'+mylocation+'/check',
    method: 'GET',
};

if (config.useHTTPS) {
    options.ca = fs.readFileSync('./keys/private-root-ca.crt.pem')
    options.agent = new https.Agent(options);
}

//query the server to see if the ID is valid
function checkPermission(tagID) {
    var body = JSON.stringify({
	rfid: tagID
    });
    
    options.headers = {
	"Content-Type": 'application/json',
	"Content-Length": Buffer.byteLength(body)
    };
    
    var request;
    if (config.useHTTPS) {
	request = https.request(options);
    } else {
	request = http.request(options);
    }
    
    //send request
    request.end(body);
    
    //wait for response
    request.on('response', function (response) {
	response.on('data', function (chunk) {
	    chunk = JSON.parse(chunk);
	    console.log(chunk);
	    if (chunk.authorized) {
		exec(config.authScript, function (error, stdout, stderr) {
		    console.log(stdout);
		});
	    } else {
		exec(config.noauthScript, function (error, stdout, stderr) {
		    console.log(stdout);
		});
	    }
	});
    });
}

function readCardData(chunk) {
    data = chunk.toString('utf-8');
    console.log("read: "+data);
    reader_data += data;
    if (reader_data.indexOf("\n") >= 0) {
	var entry = reader_data.split("\n")[0];
	reader_data = reader_data.split("\n")[1];
	checkPermission(entry);
    }
}

function spawnReaderProcess() {
    var child = spawn(config.pollScript, config.pollOptions)
    child.stdout.on('data', readCardData);
    child.stderr.on('data', function (data) {
	console.log('poll error: ' + data);
    });
    child.on('close', function (code) {
	console.log('child exited, restarting');
	spawnReaderProcess();
    });
};
    
//listen to reader
reader_data = "";
console.log("listening with ", config.pollScript);
spawnReaderProcess();
