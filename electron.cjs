const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // 禁用 Node.js API，通过 preload 暴露
      contextIsolation: true, // 启用上下文隔离，更安全
    }
  })

  // 根据开发或生产环境加载不同的 URL
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080') // Vite 开发服务器的地址
    win.webContents.openDevTools() // 打开开发者工具
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html')) // 打包后的 HTML 文件
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 监听渲染进程发送的通知请求
ipcMain.on('notify', (event, title, body) => {
  new Notification({ title, body }).show()
})