const { contextBridge, ipcRenderer } = require("electron");

// Window API Module
const windowAPI = {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window-maximize"),
  closeWindow: () => ipcRenderer.invoke("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
};

// Wallpaper API Module
const wallpaperAPI = {
  // Wallpaper functionality
  downloadWallpaper: (url, filename) =>
    ipcRenderer.invoke("download-wallpaper", { url, filename }),
  setWallpaper: (url, filename) =>
    ipcRenderer.invoke("set-wallpaper", { url, filename }),
  checkWallpaperExists: (filename) =>
    ipcRenderer.invoke("check-wallpaper-exists", { filename }),
  getLocalWallpaper: (filename) =>
    ipcRenderer.invoke("get-local-wallpaper", { filename }),
  listLocalWallpapers: () => ipcRenderer.invoke("list-local-wallpapers"),
  getLocalWallpaperThumbnail: (filename) =>
    ipcRenderer.invoke("get-local-wallpaper-thumbnail", { filename }),
  deleteLocalWallpaper: (filename) =>
    ipcRenderer.invoke("delete-local-wallpaper", { filename }),
  openWallpapersFolder: () => ipcRenderer.invoke("open-wallpapers-folder"),
};

// Rainmeter API Module
const rainmeterAPI = {
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
};

// Wallhaven API Module
const wallhavenAPI = {
  // Wallhaven API
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  wallhavenSearch: (params) => ipcRenderer.invoke("wallhaven-search", params),
  wallhavenWallpaper: (id) => ipcRenderer.invoke("wallhaven-wallpaper", id),
  wallhavenTag: (tagId) => ipcRenderer.invoke("wallhaven-tag", tagId),
  wallhavenSettings: () => ipcRenderer.invoke("wallhaven-settings"),
  wallhavenTest: () => ipcRenderer.invoke("wallhaven-test"),
};

// Update API Module
const updateAPI = {
  // Check for updates
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // Download update
  downloadUpdate: () => ipcRenderer.invoke("download-update"),

  // Install update
  installUpdate: () => ipcRenderer.invoke("install-update"),

  // Get current update info
  getUpdateInfo: () => ipcRenderer.invoke("get-update-info"),

  // Reminder functionality
  remindLater: () => ipcRenderer.invoke("remind-later"),
  getReminderState: () => ipcRenderer.invoke("get-reminder-state"),
  resetReminder: () => ipcRenderer.invoke("reset-reminder"),

  // Listen for update events
  onUpdateStatus: (callback) => {
    ipcRenderer.on("update-status", (event, data) => callback(data));
  },

  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update-available", (event, data) => callback(data));
  },

  onUpdateProgress: (callback) => {
    ipcRenderer.on("update-progress", (event, data) => callback(data));
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update-downloaded", (event, data) => callback(data));
  },

  onUpdateError: (callback) => {
    ipcRenderer.on("update-error", (event, data) => callback(data));
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// Expose the complete electronAPI
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

  // Window controls (from windowAPI module)
  ...windowAPI,

  // Wallpaper functionality (from wallpaperAPI module)
  ...wallpaperAPI,

  // Rainmeter Skin Management (from rainmeterAPI module)
  ...rainmeterAPI,

  // System utilities
  platform: process.platform,
  versions: process.versions,

  // Wallhaven API (from wallhavenAPI module)
  ...wallhavenAPI,

  // Get local wallpaper
  getLocalWallpaper: (filename) => {
    return ipcRenderer.invoke("get-local-wallpaper", { filename });
  },

  // Get local wallpaper thumbnail
  getLocalWallpaperThumbnail: (filename) => {
    return ipcRenderer.invoke("get-local-wallpaper-thumbnail", { filename });
  },

  // Verify and regenerate thumbnails for all wallpapers
  verifyWallpaperThumbnails: () => {
    return ipcRenderer.invoke("verify-wallpaper-thumbnails");
  },
});

// Expose update API separately
contextBridge.exposeInMainWorld("updateAPI", updateAPI);
