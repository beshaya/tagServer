gpio = require('./gpio');

gpio.blink(18, 4000, function(){
    console.log('bye')
})
