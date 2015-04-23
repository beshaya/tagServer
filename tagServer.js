var express = require('express');
var bodyParser = require('body-parser')
var https = require('https');
var fs = require('fs');

var users = require('./users.json');
var config = require('./client_config.json');
var groups = require('./groups.json');

//Needed for self-signed root CA's
require('ssl-root-cas')
  .inject()
  .addFile('./keys/private-root-ca.crt.pem');

//Configure https
var httpsOptions = {
  key: fs.readFileSync('./keys/server.key.pem'),
  cert: fs.readFileSync('./keys/server.crt.pem')
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
  console.log(req.body)

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
  }
  console.log("unauthorized attempt by %s to %s at %s",
	      users[rfid].name, location, Date.now())
  return res.end(JSON.stringify({
    authorized: false
  }));
});

//start listening!
https.createServer(httpsOptions, app).listen(config.serverPort);
console.log('RFID Server Listening');
