const process = require("child_process");
const fs = require("fs");

window.utools = utools;
window.execShell = process;
window.__dirname = __dirname.replace(/\s+/g, "\\ ");
window.fs = fs;
