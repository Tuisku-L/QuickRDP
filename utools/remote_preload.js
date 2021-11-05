const deviceId = utools.getNativeId();

window.deviceId = deviceId;
window.utools = utools;

const io = require('socket.io-client');
window.socketClient = io;
