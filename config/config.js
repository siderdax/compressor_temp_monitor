var config = {};

// Reconnection interval (ms)
config.interval = 3000;
// Device(USB to Serial) PID, VID
config.baudRate = 9600;
config.device = [{
  pid: '8037',
  vid: '2341'
}];

// Thermometer identifier
config.hp50 = '2';
config.hp75 = '1';
config.hp100 = '3';
config.material = '0';

module.exports = config;
