var https = require('https');
var http = require('http');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');

var config = require('./config');
var gpio = require('./gpio');

//listen to a binary script for id's, then send them to the server
//the server will respond authorized or not
//if authorized, call the binary script to let them in

var mylocation = config.location

var options = {
    hostname: config.serverIP,
    port: config.serverPort,
    path: '/'+mylocation+'/check',
    method: 'POST',
};

if (config.useHTTPS) {
    require('nodetrustrest');
    require('ssl-root-cas')
	.inject()
	.addFile('./keys/rest-ca-chain.crt');
}

//query the server to see if the ID is valid
function checkPermission(tagID) {
    //verify that the response is a tag number
    var idPattern = /[0-9a-fA-F]{14}/;
    var match = tagID.match(idPattern);
    if (!match) return;
    gpio.off(config.denyLED);
    var body = JSON.stringify({
	rfid: match[0]
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
		gpio.blink(config.allowLED, 4000, function(){
		    setTimeout(function(){
			gpio.on(config.denyLED);
		    }, 500);
		})
	    } else {
//		exec(config.noauthScript, function (error, stdout, stderr) {
//		    console.log(stdout);
		//		});
		gpio.off(config.denyLED)
		setTimeout(function(){
		    gpio.blink(config.denyLED, 1000, function(){
			setTimeout(function(){
			    gpio.on(config.denyLED);
			}, 2000);
		    })
		}, 500);
	    }
	});
    });
    request.on('error', function(err) {
	console.log(err);
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

var child
var keepReaderRunning = false;

function spawnReaderProcess() {
    //kill any existing polling scripts
    child = spawn(config.pollScript, config.pollOptions)
    child.stdout.on('data', readCardData);
    child.stderr.on('data', function (data) {
	console.log('poll error: ' + data);
    });

    child.on('exit', function (code) {
	//occurs on kill
	respawnReader()
    });
    
};

function respawnReader() {
    if (!keepReaderRunning) return process.exit();
    console.log('child closed, restarting');
    setTimeout(spawnReaderProcess, 5000);
}

function exitHandler() {
    keepReaderRunning = false;
    console.log("Shutting down client")
    child.kill();
}

//process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
//process.on('uncaughtException', errorHandler);
    
//listen to reader
reader_data = "";
console.log("listening with ", config.pollScript);
gpio.on(config.denyLED);
spawnReaderProcess();
