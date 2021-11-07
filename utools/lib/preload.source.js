const process = require('child_process');
const fs = require('fs');
const os = require('os');
// const {
//   desktopCapturer,
//   ipcRenderer
// } = require('electron');

window.utools = utools;
window.execShell = process;
window.__dirname = __dirname.replace(/\s+/g, '\\ ');
window.fs = fs;
window.os = os;
// window.desktopCapturer = desktopCapturer;
// window.ipcRenderer = ipcRenderer;

const socket = require('socket.io')(9550);
console.info('socket', socket);
window.socketServer = null;

const io = require('socket.io-client');
window.socketClient = io;
window.socketLocal = null;

socket.on('connection', (socketServer) => {
  console.info('connection');
  window.socketServer = socketServer;

  socketServer.on('rdp_connection_ready', (data) => {
    console.info('收到远程桌面 rdp_connection_ready 请求', data);
    // 连接本机 WS 服务器
    socketServer.broadcast.emit('rdp_connection_ready', data);
  });

  socketServer.on('rdp_remote_info', (data) => {
    console.info('收到远程桌面 rdp_remote_info 请求', data);
    // 连接本机 WS 服务器
    socketServer.broadcast.emit('rdp_remote_info', data);
  });

  socketServer.on('rdp_login_success', (data) => {
    console.info('收到远程桌面 rdp_login_success 请求', data);
    // 连接本机 WS 服务器
    socketServer.broadcast.emit('rdp_login_success', data);
  });

  socketServer.on('rdp_login_faild', (data) => {
    console.info('收到远程桌面 rdp_login_faild 请求', data);
    // 连接本机 WS 服务器
    socketServer.broadcast.emit('rdp_login_faild', data);
  });

  socketServer.on('rdp_login_try', (data) => {
    console.info('收到远程桌面 rdp_login_try 请求', data);
    // 连接本机 WS 服务器
    socketServer.broadcast.emit('rdp_login_try', data);
  });

  socketServer.on('rdp_pre_connection', (data) => {
    console.info('收到远程桌面预连接请求', data);
    // 连接本机 WS 服务器
    socketServer.broadcast.emit('rdp_pre_connection', data);
  });

  socketServer.on('rdp_webrtc_offer', (data) => {
    console.info('收到远程桌面 offer 请求', data);
    socketServer.broadcast.emit('rdp_webrtc_offer', data);
  });

  socketServer.on('rdp_webrtc_answer', (data) => {
    console.info('收到远程桌面 answer 请求', data);
    socketServer.broadcast.emit('rdp_webrtc_answer', data);
  });

  socketServer.on('rdp_connection', (data) => {
    console.info('收到远程桌面 connection 请求', data);
    socketServer.broadcast.emit('rdp_connection', data);
  });

  socketServer.on('rdp_offer_cecandidate', (data) => {
    console.info('收到远程桌面 rdp_offer_cecandidate 请求', data);
    socketServer.broadcast.emit('rdp_offer_cecandidate', data);
  });

  socketServer.on('rdp_answer_cecandidate', (data) => {
    console.info('收到远程桌面 rdp_answer_cecandidate 请求', data);
    socketServer.broadcast.emit('rdp_answer_cecandidate', data);
  });

  socketServer.on('rdp_event_click', (data) => {
    console.info('收到远程桌面 rdp_event_click 请求', data);
    socketServer.broadcast.emit('rdp_event_click', data);
  });

  socketServer.on('rdp_verify_type', (data) => {
    console.info('收到远程桌面 rdp_verify_type 请求', data);
    socketServer.broadcast.emit('rdp_verify_type', data);
  });

  socketServer.on('rdp_disconnection', (data) => {
    console.info('收到远程桌面 rdp_disconnection 请求', data);
    socketServer.broadcast.emit('rdp_disconnection', data);
  });
});
