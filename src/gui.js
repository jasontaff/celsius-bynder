const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('run-sync-js', (event) => {
  const syncProcess = spawn('node', ['testsync.js']);
  
  syncProcess.stdout.on('data', (data) => {
    mainWindow.webContents.send('log', data.toString());
  });

  syncProcess.stderr.on('data', (data) => {
    mainWindow.webContents.send('log', data.toString());
  });
});
