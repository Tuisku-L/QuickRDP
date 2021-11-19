const { ipcRenderer } = require('electron');
const { argv } = require('yargs');

window.utools = utools;
window.ipcRenderer = ipcRenderer;

console.info('window.process.argv', argv);
