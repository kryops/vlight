const { app, BrowserWindow } = require('electron')

function createWindow() {
  let win = new BrowserWindow({
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  win.loadURL('http://localhost:8000')
  win.webContents.openDevTools()
  win.on('closed', () => (win = null))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

require('./backend/dist/index')
