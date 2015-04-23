var https = require('https');
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
  ca: fs.readFileSync('./keys/private-root-ca.crt.pem')
};

options.agent = new https.Agent(options);

//query the server to see if the ID is valid
function checkPermission(tagID) {
  var body = JSON.stringify({
    rfid: tagID
  })

  options.headers = {
    "Content-Type": 'application/json',
    "Content-Length": Buffer.byteLength(body)
  }
  
  var request = https.request(options);

  //send request
  request.end(body)

  //wait for response
  request.on('response', function (response) {
    response.on('data', function (chunk) {
      chunk = JSON.parse(chunk)
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
  })

}

//listen to reader
reader_data = ""
console.log("listening with ", config.pollScript)
var child = spawn(config.pollScript, config.pollOptions)
child.stdout.on('data', function (chunk) {
    data = chunk.toString('utf-8');
    console.log("read: "+data);
    reader_data += data
    if (reader_data.indexOf("\n") >= 0) {
	var entry = reader_data.split("\n")[0];
	reader_data = reader_data.split("\n")[1];
	checkPermission(entry)
    }
});
child.stderr.on('data', function (data) {
    console.log('stderr: ' + data)
});
child.on('close', function (code) {
    console.log('child exited');
});
