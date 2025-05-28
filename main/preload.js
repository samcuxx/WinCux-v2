const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // General IPC communication
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window-maximize"),
  closeWindow: () => ipcRenderer.invoke("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),

  // Wallpaper functionality
  downloadWallpaper: (url, filename) =>
    ipcRenderer.invoke("download-wallpaper", { url, filename }),
  setWallpaper: (url, filename) =>
    ipcRenderer.invoke("set-wallpaper", { url, filename }),
  checkWallpaperExists: (filename) =>
    ipcRenderer.invoke("check-wallpaper-exists", { filename }),

  // System utilities
  platform: process.platform,
  versions: process.versions,
});
