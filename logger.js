/**
 * JSON-Based log file w/ tailing read
 */

var debug = require('debug')('logger');
var fs = require('fs');

var Logger = module.exports = function Logger(filename, numberLines) {
  if (!(this instanceof Logger)) return new Logger(filename, numberLines);

  this.numLines = +numberLines || 50;
  this.filename = filename;

  this.file = fs.createWriteStream(this.filename, {flags: 'a'});

  var data = fs.readFileSync(filename, 'utf8');
  var lines = data.split('\n');
  lines = lines.slice(-1 * this.numLines, -1);
  this.lines = lines.map(function(l) {
    try {
      return JSON.parse(l);
    } catch (e) {
      return {timestamp: -1, data: {}, message: 'Malformed log line'};
    }
  });

  debug('Found %s lines', lines.length);
};


Logger.prototype.log = function(object, message) {
  // Perform the argument shuffle
  if (typeof object === 'string') {
    message = object;
    object = {};
  }

  try {
    var data = {
      message: message,
      data: object,
      timestamp: Date.now()
    };
    message = JSON.stringify(data);

    // Log to file first
    this.file.write(message + '\n');
    console.log(message);

    this.lines.push(data);
    if (this.lines.length > this.numLines) this.lines.shift();

  } catch (e) {
    debug('Error recording log: %s', e);
  }
};

Logger.prototype.get = function(numLines) {
  numLines = +numLines || 10;
  return this.lines.slice(-1 * numLines);
};
