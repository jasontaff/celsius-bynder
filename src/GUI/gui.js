const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let testProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

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

ipcMain.on('run-test', () => {
  if (!testProcess) {
    testProcess = spawn('node', ['test.js']);

    testProcess.stdout.on('data', data => {
      mainWindow.webContents.send('log', data.toString());
    });

    testProcess.stderr.on('data', data => {
      mainWindow.webContents.send('log', data.toString());
    });

    testProcess.on('exit', () => {
      testProcess = null;
    });
  }
});

ipcMain.on('stop-test', () => {
  if (testProcess) {
    testProcess.kill();
    testProcess = null;
  }
});
