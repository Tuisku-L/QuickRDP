
const { ipcRenderer } = require('electron');
const deviceId = utools.getNativeId();

window.deviceId = deviceId;
window.utools = utools;
window.ipcRenderer = ipcRenderer;

const io = require('socket.io-client');
window.socketClient = io;
