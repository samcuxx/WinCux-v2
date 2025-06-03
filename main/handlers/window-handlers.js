const { ipcMain } = require("electron");

function setupWindowHandlers(win) {
  // Window control handlers
  ipcMain.handle("window-minimize", () => {
    win.minimize();
  });

  ipcMain.handle("window-maximize", () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle("window-close", () => {
    win.close();
  });

  ipcMain.handle("window-is-maximized", () => {
    return win.isMaximized();
  });
}

module.exports = { setupWindowHandlers };
