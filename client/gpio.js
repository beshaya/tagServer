var fs = require('fs');

function GPIOExport(pin) {
    try {
	var fd = fs.openSync('/sys/class/gpio/export', 'w');
	fs.writeSync(fd, ''+pin);
	fs.closeSync(fd);
    } catch (e) {}
}

function GPIODirection(pin, direction) {
    if (direction !== 'out' && direction !== 'in') return;
    var fd = fs.openSync('/sys/class/gpio/gpio' + pin + '/direction', 'w');
    fs.writeSync(fd, direction);
    fs.closeSync(fd);
}

function GPIOWrite(pin, value) {
    if (value !== 0 && value !== 1) return;
    var fd = fs.openSync('/sys/class/gpio/gpio' + pin + '/value', 'w');
    fs.writeSync(fd, value);
    fs.closeSync(fd);
}

function blink(pin, duration, callback) {
    on(pin)
    setTimeout(function() {
	off(pin);
	callback();
    }, duration)
}

function on(pin) {
    GPIOExport(pin);
    GPIODirection(pin, 'out');
    GPIOWrite(pin, 1);
}

function off(pin) {
    try {
	GPIOWrite(pin, 0);
    } catch (e) {
	//an error probably means the pin wasn't exported, so it probably wasn't on
    }
}

module.exports = {
    blink: blink,
    on: on,
    off: off,
}
