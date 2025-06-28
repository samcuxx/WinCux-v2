const { app } = require("electron");
const { autoUpdater } = require("electron-updater");
const { ipcMain } = require("electron");
const log = require("electron-log");
const Store = require("electron-store");

const store = new Store({
  name: "update-preferences",
  defaults: {
    remindLaterTimestamp: 0,
    remindLaterInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
});

let mainWindow;
let updateAvailable = false;
let updateDownloaded = false;
let updateInfo = null;

function shouldShowUpdateNotification() {
  const remindLaterTimestamp = store.get("remindLaterTimestamp");
  const remindLaterInterval = store.get("remindLaterInterval");

  // If no reminder was set, or if the reminder interval has passed
  return (
    remindLaterTimestamp === 0 ||
    Date.now() - remindLaterTimestamp >= remindLaterInterval
  );
}

function setupUpdateHandlers(window) {
  mainWindow = window;

  // Configure logging
  log.transports.file.level = "debug";
  log.info("Update handler setup starting...");

  // Configure auto-updater
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.logger = log;
  autoUpdater.forceDevUpdateConfig = !app.isPackaged;
  autoUpdater.requireSecurityDescription = false;
  autoUpdater.disableWebInstaller = false;

  // Auto-updater events
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates...");
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-status", { status: "checking" });
    }
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info);
    updateAvailable = true;
    updateInfo = info;

    // Only notify if we should show the notification
    if (shouldShowUpdateNotification()) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-available", info);
      }
    } else {
      log.info("Update notification suppressed due to remind later setting");
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available:", info);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-status", { status: "not-available" });
    }
  });

  autoUpdater.on("error", (err) => {
    log.error("Auto-updater error:", err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      // Handle signature verification errors specially
      if (
        err.code === "ERR_UPDATER_INVALID_SIGNATURE" ||
        err.code === "ERR_UPDATER_SIGNATURE_VERIFICATION_FAILED" ||
        err.message.includes("is not signed") ||
        err.message.includes("not signed by the application owner")
      ) {
        log.info("Attempting to install unsigned update...");
        if (updateDownloaded) {
          autoUpdater.quitAndInstall(false, true);
          return;
        }
      }
      mainWindow.webContents.send("update-error", {
        error: err.message || "Unknown update error",
        code: err.code,
      });
    }
  });

  autoUpdater.on("download-progress", (progressObj) => {
    log.info("Download progress:", progressObj.percent.toFixed(2) + "%");
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-progress", progressObj);
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info);
    updateDownloaded = true;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-downloaded", info);
    }
  });

  // IPC handlers
  ipcMain.handle("check-for-updates", async () => {
    try {
      log.info("Manual update check requested");
      if (!app.isPackaged) {
        log.info("Skipping update check in development mode");
        return {
          success: false,
          error: "Updates are only available in production builds",
        };
      }

      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (error) {
      log.error("Error checking for updates:", error);
      return {
        success: false,
        error: error.message || "Failed to check for updates",
      };
    }
  });

  ipcMain.handle("download-update", async () => {
    try {
      if (!updateAvailable) {
        throw new Error("No update available to download");
      }
      log.info("Starting update download...");
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      log.error("Error downloading update:", error);
      return {
        success: false,
        error: error.message || "Failed to download update",
      };
    }
  });

  ipcMain.handle("install-update", async () => {
    try {
      if (!updateDownloaded) {
        throw new Error("No update downloaded to install");
      }
      log.info("Installing update...");
      // Force install even if unsigned
      autoUpdater.quitAndInstall(false, true);
      return { success: true };
    } catch (error) {
      log.error("Error installing update:", error);
      return {
        success: false,
        error: error.message || "Failed to install update",
      };
    }
  });

  ipcMain.handle("get-update-info", () => {
    return {
      currentVersion: app.getVersion(),
      updateAvailable,
      updateDownloaded,
      updateInfo,
    };
  });

  // Add new IPC handlers for reminder functionality
  ipcMain.handle("remind-later", () => {
    log.info("Setting remind later timestamp");
    store.set("remindLaterTimestamp", Date.now());
    return { success: true };
  });

  ipcMain.handle("get-reminder-state", () => {
    return {
      shouldShow: shouldShowUpdateNotification(),
      nextReminderTime:
        store.get("remindLaterTimestamp") + store.get("remindLaterInterval"),
    };
  });

  ipcMain.handle("reset-reminder", () => {
    log.info("Resetting remind later state");
    store.set("remindLaterTimestamp", 0);
    return { success: true };
  });

  // Auto-check for updates on app start (with delay)
  setTimeout(() => {
    if (!app.isPackaged) {
      log.info("Skipping update check in development mode");
      return;
    }
    log.info("Auto-checking for updates...");
    autoUpdater.checkForUpdates().catch((err) => {
      log.error("Auto-update check failed:", err);
    });
  }, 5000); // 5 second delay
}

module.exports = { setupUpdateHandlers };
