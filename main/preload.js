const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // General IPC communication
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
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

  // Rainmeter Skin Management
  downloadRainmeterSkin: (url, filename, skinId) =>
    ipcRenderer.invoke("download-rainmeter-skin", { url, filename, skinId }),
  installRainmeterSkin: (skinPath, skinId, skinName) =>
    ipcRenderer.invoke("install-rainmeter-skin", {
      skinPath,
      skinId,
      skinName,
    }),
  toggleRainmeterSkin: (skinId, skinName, skinPath, isEnabled) =>
    ipcRenderer.invoke("toggle-rainmeter-skin", {
      skinId,
      skinName,
      skinPath,
      isEnabled,
    }),
  configureRainmeterSkin: (skinId, skinName, skinPath) =>
    ipcRenderer.invoke("configure-rainmeter-skin", {
      skinId,
      skinName,
      skinPath,
    }),
  getInstalledRainmeterSkins: () =>
    ipcRenderer.invoke("get-installed-rainmeter-skins"),
  uninstallRainmeterSkin: (skinId, skinName, skinPath) =>
    ipcRenderer.invoke("uninstall-rainmeter-skin", {
      skinId,
      skinName,
      skinPath,
    }),
  openRainmeterConfig: () => ipcRenderer.invoke("open-rainmeter-config"),

  // System utilities
  platform: process.platform,
  versions: process.versions,

  // Wallhaven API
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  wallhavenSearch: (params) => ipcRenderer.invoke("wallhaven-search", params),
  wallhavenWallpaper: (id) => ipcRenderer.invoke("wallhaven-wallpaper", id),
  wallhavenTag: (tagId) => ipcRenderer.invoke("wallhaven-tag", tagId),
  wallhavenSettings: () => ipcRenderer.invoke("wallhaven-settings"),
  wallhavenTest: () => ipcRenderer.invoke("wallhaven-test"),
});
