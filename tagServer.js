var express = require('express');
var bodyParser = require('body-parser')

var users = require('./users.json');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', function (req, res) {
  res.end("rfid server running")
})

app.get('/:group/check', function (req, res) {
  console.log(req.body)
  var rfid = req.body.rfid;
  if (!users.hasOwnProperty(rfid)) {
    console.log("unrecognized tag: ",rfid)
    return res.end("{'authorized': false}")
  }
 
});

var server = app.listen(8080, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('RFID Server listening at http://%s:%s', host, port);
})
