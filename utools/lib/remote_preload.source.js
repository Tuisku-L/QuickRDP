// const {
//   ipcRenderer
// } = require('electron');

window.utools = utools;
// window.ipcRenderer = ipcRenderer;

const io = require('socket.io-client');
window.socketClient = io;
