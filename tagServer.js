var exec = require('child_process').exec;
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var https = require('https');
var http = require('http');
var exphbs  = require('express-handlebars');

var config = require('./client_config.json');

// Setup data!
var logger = new (require('./logger'))('./logs.json');
var Users = new (require('./users'))('./users.json');
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Needed for self-signed root CA's
if (config.useHTTPS) {
  require('ssl-root-cas')
    .inject()
    .addFile('./keys/private-root-ca.crt.pem');
}

// Configure https
var httpsOptions;

if (config.useHTTPS) {
  httpsOptions = {
    key: fs.readFileSync('./keys/server.key.pem'),
    cert: fs.readFileSync('./keys/server.crt.pem')
  };
}

/**
 * App Setup & Middleware
 * 
 */

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


/**
 * Main Routes!
 * =============================================================================
 */

// Main page just to check things are working
app.get('/', function(req, res) {
  return res.render('home');
});

app.get('/add', function(req, res) {
  return res.render('add');
});

// Add a user to the list of users
app.post('/add', function(req, res) {
  if (!ADMIN_PASSWORD) {
    logger.log('No admin password set, cannot add users');
    return res.redirect('/');
  }

  if (req.body.pass !== ADMIN_PASSWORD) {
    logger.log('Add attempted with incorrect admin password');
    return res.redirect('/');
  }

  var user = Users.add(req.body);
  if (user) logger.log('Added user ' + user.name);
  return res.redirect('/');
});

// Access here!
app.post('/:location/check', function(req, res) {
  var code = req.body.rfid;
  var location = req.params.location;
  var user = Users.get(code);
  if (!user) {
    logger.log({code: code}, 'Access attempted at ' + location + ' with invalid code');
    return res.status(403).send({authorized: false});
  }

  logger.log(user.name + ' opened ' + req.params.location);

  //let them in
  exec(config.openDoorScript + ' ' + config.relays[location], function (error, stdout, stderr) {
    if (stdout) {
      console.log({timestamp: Date.now(), message: stdout});
    }
  });
  
  return res.send({authorized: true});
});

// Display the logs from the service
app.get('/logs', function(req, res) {
  var admin = (req.query.pass === ADMIN_PASSWORD);

  var logs = logger.get(50);

  if (!admin) {
    logs = logs.map(function(l) {
      return {timestamp: l.timestamp, message: l.message};
    });
  }

  res.send(logs);
});


/**
 * Start listening
 * =============================================================================
 */
if (config.useHTTPS) {
  https.createServer(httpsOptions, app).listen(config.serverPort);
} else {
  http.createServer(app).listen(config.serverPort);
}

logger.log('Starting door server');
