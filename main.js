/* load serialport configs */
var config = require('./config/config.js');

/* express */
var express = require('express');
var expressApp = express();
var router = require('./router/router')(expressApp);

/* ejs views */
expressApp.set('views', __dirname + '/views');
expressApp.set('view engine', 'ejs');
expressApp.engine('html', require('ejs').renderFile);
var server = require('http').createServer(expressApp);
var io = require('socket.io').listen(server);
server.listen(3000, function () {
  console.log("Express server has started on port 3000")
});
expressApp.use(express.static('public'));

/* Serial device */
var serialDevice = require('./lib/serialDevice');
var sd0 = new serialDevice();
var sd = [];
var sensorCount = 0;

sd0.addDeviceList(config.device[0]);
sd0.setBaudRate(config.baudRate);
sd0.setCheckInterval(config.interval);

sd0.findDevice(function (err, comName) {
    sd[sensorCount] = new serialDevice();
    sd[sensorCount].setReadlineParser(function (data) {
      /* Sent from serial devices
       * Data format:
       * id,temperature,humidity(optional)
       */
      var datArr = data.split(',');
      
      if(datArr[0] === config.hp50) {
        io.sockets.emit('data50', {
          "temperature": datArr
        });
      } else if(datArr[0] === config.hp75) {
        io.sockets.emit('data75', {
          "temperature": datArr
        });
      } else if(datArr[0] === config.hp100) {
        io.sockets.emit('data100', {
          "temperature": datArr
        });
      }
      else if(datArr[0] === config.material) {
        io.sockets.emit('datamisc', {
          "temperature": datArr
        });
      }
    });
    sd[sensorCount].connectWithComName(comName, function (port) {
    });
    sensorCount++;
});
