const process = require("child_process");
const fs = require("fs");
const screenshot = require('screenshot-desktop');
const os = require("os");

window.utools = utools;
window.screenshotDesktop = screenshot;
window.execShell = process;
window.__dirname = __dirname.replace(/\s+/g, "\\ ");
window.fs = fs;
window.os = os;

const eths = os.networkInterfaces();
const address = [];
for (let name in eths) {
  const interface = eths[name];
  address.concat(interface.filter(x => x.family === "IPv4" && x.address !== "127.0.0.1" && !x.internal));
}
