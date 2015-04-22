var http = require('http');

var body = JSON.stringify({
  rfid: "DEADBEEF"
})

var request = new http.ClientRequest({
  hostname: '10.0.31.31',
  port: '8080',
  path: '/door/check',
  method: "GET",
  headers: {
    "Content-Type": 'application/json',
    "Content-Length": Buffer.byteLength(body)
  }
  
})

request.end(body)

request.on('response', function (response) {
  response.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
})
