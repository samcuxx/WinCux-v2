const { contextBridge, ipcRenderer } = require("electron");

// Update API
contextBridge.exposeInMainWorld("updateAPI", {
  // Check for updates
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // Download update
  downloadUpdate: () => ipcRenderer.invoke("download-update"),

  // Install update
  installUpdate: () => ipcRenderer.invoke("install-update"),

  // Get current update info
  getUpdateInfo: () => ipcRenderer.invoke("get-update-info"),

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
});
