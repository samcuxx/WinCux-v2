const { autoUpdater, app } = require("electron-updater");
const { ipcMain, dialog } = require("electron");
const path = require("path");

let mainWindow;
let updateAvailable = false;
let updateDownloaded = false;
let updateInfo = null;

function setupUpdateHandlers(window) {
  mainWindow = window;

  // Configure auto-updater
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Simple logger since electron-log might not be available
  const logger = {
    info: (message) => console.log("[UPDATE]", message),
    error: (message) => console.error("[UPDATE ERROR]", message),
    warn: (message) => console.warn("[UPDATE WARN]", message),
  };

  autoUpdater.logger = logger;

  // Auto-updater events
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
    mainWindow.webContents.send("update-status", { status: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available:", info);
    updateAvailable = true;
    updateInfo = info;
    mainWindow.webContents.send("update-available", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("Update not available:", info);
    mainWindow.webContents.send("update-status", { status: "not-available" });
  });

  autoUpdater.on("error", (err) => {
    console.error("Auto-updater error:", err);
    mainWindow.webContents.send("update-error", { error: err.message });
  });

  autoUpdater.on("download-progress", (progressObj) => {
    console.log("Download progress:", progressObj);
    mainWindow.webContents.send("update-progress", progressObj);
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded:", info);
    updateDownloaded = true;
    mainWindow.webContents.send("update-downloaded", info);
  });

  // IPC handlers
  ipcMain.handle("check-for-updates", async () => {
    try {
      console.log("Manual update check requested");
      await autoUpdater.checkForUpdates();
      return { success: true };
    } catch (error) {
      console.error("Error checking for updates:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("download-update", async () => {
    try {
      if (!updateAvailable) {
        throw new Error("No update available to download");
      }
      console.log("Starting update download...");
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error("Error downloading update:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("install-update", async () => {
    try {
      if (!updateDownloaded) {
        throw new Error("No update downloaded to install");
      }
      console.log("Installing update...");
      autoUpdater.quitAndInstall();
      return { success: true };
    } catch (error) {
      console.error("Error installing update:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("get-update-info", () => {
    return {
      currentVersion: require("electron").app.getVersion(),
      updateAvailable,
      updateDownloaded,
      updateInfo,
    };
  });

  // Auto-check for updates on app start (with delay)
  setTimeout(() => {
    if (!require("electron").app.isPackaged) {
      console.log("Skipping update check in development mode");
      return;
    }
    console.log("Auto-checking for updates...");
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("Auto-update check failed:", err);
    });
  }, 5000); // 5 second delay
}

module.exports = { setupUpdateHandlers };
