var express = require('express');
var bodyParser = require('body-parser')
var https = require('https');
var fs = require('fs');

var users = require('./users.json');

var config = require('./client_config.json');

require('ssl-root-cas')
  .inject()
  .addFile('./keys/private-root-ca.crt.pem');

var httpsOptions = {
  key: fs.readFileSync('./keys/server.key.pem'),
  cert: fs.readFileSync('./keys/server.crt.pem')
}

var app = express();

https.createServer(httpsOptions, app).listen(config.serverPort);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', function (req, res) {
  res.end("rfid server running")
})

app.get('/:group/check', function (req, res) {
  console.log(req.body)

  var group = req.params.group

  var rfid = req.body.rfid;
  if (!users.hasOwnProperty(rfid)) {
    console.log("unrecognized tag: ",rfid)
    return res.end(JSON.stringify({
      authorized: false
    }));
  }
  if (users[rfid].access[group]) {
    console.log(users[rfid].name, " accessed ", group, "at ", Date.now())
    return res.end(JSON.stringify({
      authorized: true
    }));
  }
  console.log("unauthorized attempt by", users[rfid].name, " to ", group,
	      " at ", Date.now())
  return res.end(JSON.stringify({
    authorized: false
  }));
});

/*
var server = app.listen(8080, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('RFID Server listening at http://%s:%s', host, port);
})
*/
