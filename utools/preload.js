const process = require("child_process");
const fs = require("fs");
const os = require("os");
const {
  desktopCapturer
} = require("electron");

window.utools = utools;
window.execShell = process;
window.__dirname = __dirname.replace(/\s+/g, "\\ ");
window.fs = fs;
window.os = os;
window.desktopCapturer = desktopCapturer;

// const socket = require("socket.io")(9550);
// window.socketServer = null;

// const io = require("socket.io-client");
// window.socketClient = io;
// window.socketLocal = io.connect("ws://localhost:9550");

// socket.on("connection", (socketServer) => {
//   console.info("connection");
//   window.socketServer = socketServer;

//   socketServer.on("rdp_pre_connection", () => {
//     console.info("收到远程桌面预连接请求");
//     // 连接本机 WS 服务器
//   });

//   socketServer.on("rdp_disconnection", () => {
//     console.info("收到远程桌面关闭请求");
//     if (client != null) {
//       window.socketLocal.disconnect()
//     }
//   });
// });
