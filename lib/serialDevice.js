/*
 * 시리얼 통신 디바이스 연결용 모듈
 * 사용하려면 다음 순서로 설정 후 연결을 시도해야 함.
 * 1. baudRate(설정 없을 경우 9600)
 * 2. 디바이스 리스트
 *    a. 디바이스 리스트는 아래 형식의 배열을 set(add)DeviceList함수를 통해
 *       추가가 가능함. 조건에 맞는 장치 하나를 연결 시도 함
 *      (a) deviceList = [{
 *                pid: '0000',
 *                vid: '0000'
 *          }];
 *      (b) deviceList = [{
 *                manufacturer: 'Barcode_Scanner'
 *          }];
 *      (c) deviceList = [{
 *                pid: '0000',
 *                vid: '0000',
 *                manufacturer: 'Barcode_Scanner'
 *          }];
 *    b. 디바이스 리스트가 없을 경우 아무 시리얼 포트 장치 중 검색된 포트로 연결을 함
 */
function SerialDevice() {
  'use strict';

  var SerialPort = require('serialport');
  var port = null;
  var deviceChecker = null;
  var parser = null;

  var baud = 9600;
  var openCheckInterval = 3000;
  var devList = [];

  /* Settings */
  this.getBaudRate = function () {
    return baud;
  }

  this.setBaudRate = function (baudRate) {
    baud = baudRate;
  }

  this.getDeviceList = function () {
    return devList;
  }

  this.setDeviceList = function (arrList) {
    devList = arrList.slice();
  }

  this.addDeviceList = function (list) {
    devList.push(list);
  }

  /* Parsers */
  this.setReadlineParser = function (callback) {
    var Readline = SerialPort.parsers.Readline;
    parser = new Readline();
    parser.on('data', callback);
  }

  /* Connecting device */
  this.findDevice = function (callback) {
    SerialPort.list(function (err, ports) {
      ports.forEach(function (port) {
        for (var di in devList) {
          var id = 0;
          if ((devList[di].pid === port.productId ||
              typeof devList[di].pid === 'undefined') &&
            (devList[di].vid === port.vendorId ||
              typeof devList[di].vid === 'undefined') &&
            (devList[di].manufacturer === port.manufacturer ||
              typeof devList[di].manufacturer === 'undefined')) {
            console.log('--------------------------------------');
            console.log('comName: ' + port.comName);
            console.log('productId: ' + port.productId);
            console.log('vendorId: ' + port.vendorId);
            console.log('manufacturer: ' + port.manufacturer);
            console.log('--------------------------------------');
            callback(null, port.comName);
          }
        }
      });
    });
  }

  /*
   * COM Name으로 연결
   */
  this.connectWithComName = function (comName, callback) {
    port = new SerialPort(comName, {
      autoOpen: false,
      baudRate: baud
    });
    if (parser !== null)
      port.pipe(parser);
    port.open(function () {
      callback(port);
    });
  }

  /*
   * 장치 연결 시도 함수, 시리얼 포트 open한 뒤 콜백
   */
  this.connectDevice = function (callback) {
    findDevice(function (err, comName) {
      connectWithComName(comName, callback);
    });
  }

  /*
   * 이 함수를 사용해 시리얼 통신을 연결한 뒤 일정 시간 간격으로 장치 연결상태 확인 후
   * 연결이 안 되어 있을 경우 재연결 시도
   */
  this.startAutoReconnect = function () {
    if (port === null) return 'Error: Connect device first.';
    deviceChecker = setInterval(function () {
      var portOpening = false;
      if (port.isOpen === false && portOpening === false) {
        portOpening = true;
        findDevice(function (err, device) {
          port = new SerialPort(device, {
            autoOpen: false,
            baudRate: baud
          });
          if (parser !== null)
            port.pipe(parser);
          // open 전에 이전 포트 상태가 closed인지 확인 필요(누수 위험성 예방)
          port.open(function () {
            portOpening = false;
          });
        });
      }
    }, openCheckInterval);
    return 'AutoReconnection interval is started.';
  }

  this.stopAutoReconnect = function () {
    if (deviceChecker !== null)
      clearInterval(deviceChecker);
  }

  this.getCheckInterval = function () {
    return openCheckInterval;
  }

  this.setCheckInterval = function (interval) {
    openCheckInterval = interval;
  }
};

module.exports = SerialDevice;