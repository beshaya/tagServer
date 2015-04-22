var http = require('http');
var exec = require('child_process').exec;

var config = require('./client_config')

//listen to a binary script for id's, then send them to the server
//the server will respond authorized or not
//if authorized, call the binary script to let them in

var mylocation = config.location

//query the server to see if the ID is valid
function checkPermission(tagID) {
  var body = JSON.stringify({
    rfid: tagID
  })

  var request = new http.ClientRequest({
    hostname: config.serverIP,
    port: config.serverPort,
    path: '/'+mylocation+'/check',
    method: "GET",
    headers: {
      "Content-Type": 'application/json',
      "Content-Length": Buffer.byteLength(body)
    }
  })
  //send request
  request.end(body)

  //wait for response
  request.on('response', function (response) {
    response.on('data', function (chunk) {
      chunk = JSON.parse(chunk)
      console.log(chunk);
      if (chunk.authorized) {
	console.log('beep boop')
      }
    });
  })

}

//listen to reader
exec('ls', function (error, stdout, stderr) {
  checkPermission(stdout+"")
})
