/**
 * JSON-Based user storage
 */

var debug = require('debug')('users');
var fs = require('fs');

var Users = module.exports = function Users(filename) {
  if (!(this instanceof Users)) return new Users(filename);

  this.filename = filename;
  this.file = fs.createWriteStream(this.filename, {flags: 'a'});

  var data = fs.readFileSync(filename, 'utf8');
  var lines = data.split('\n');
  var users = {};
  lines.forEach(function(l) {
    try {
      if (l.length > 0) {
        var u = JSON.parse(l);
        users[u.code] = u;
      }
    } catch (e) {
      debug('Error parsing user: %s', e);
    }
  });

  this.users = users;
  debug('Found %s users', Object.keys(this.users).length);
};


// Logger.prototype.log = function(object, message) {
//   // Perform the argument shuffle
//   if (typeof object === 'string') {
//     message = object;
//     object = {};
//   }

//   try {
//     var data = {
//       message: message,
//       data: object,
//       timestamp: Date.now()
//     };
//     message = JSON.stringify(data);

//     // Log to file first
//     this.file.write(message + '\n');
//     console.log(message);

//     this.lines.push(data);

//   } catch (e) {
//     debug('Error recording log: %s', e);
//   }
// };

Users.prototype.add = function(user) {
  debug('Adding user');
  if (!user.name) return;
  if (!user.code) return;
  if (this.users[user.code]) {
    debug('User with that code already exists');
    return;
  }

  user = {
    name: user.name,
    code: user.code
  };

  try {
    this.file.write(JSON.stringify(user) + '\n');
    this.users[user.code] = user;
    debug('User added');
    return user;

  } catch (e) {
    debug('Error adding user: %s', e);
    return;
  }
};

Users.prototype.get = function(code) {
  if (!code) return;
  return this.users[code];
};
