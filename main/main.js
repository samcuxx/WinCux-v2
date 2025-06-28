const { app, BrowserWindow } = require("electron");
const serve = require("electron-serve");
const path = require("path");

// Import modular handlers
const { setupWindowHandlers } = require("./handlers/window-handlers");
const { setupWallpaperHandlers } = require("./handlers/wallpaper-handlers");
const { setupRainmeterHandlers } = require("./handlers/rainmeter-handlers");
const { setupWallhavenHandlers } = require("./handlers/wallhaven-handlers");
const { setupUpdateHandlers } = require("./handlers/update-handlers");

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on(
    "second-instance",
    (event, commandLine, workingDirectory, additionalData) => {
      // Someone tried to run a second instance, we should focus our window.
      const windows = BrowserWindow.getAllWindows();
      if (windows.length) {
        const mainWindow = windows[0];
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();

        // Handle any command line arguments or deep linking here if needed
        if (commandLine.length > 1) {
          // Process additional command line arguments if necessary
          // mainWindow.webContents.send('process-argv', commandLine);
        }
      }
    }
  );

  const appServe = app.isPackaged
    ? serve({
        directory: path.join(__dirname, "../out"),
      })
    : null;

  const createWindow = () => {
    const win = new BrowserWindow({
      width: 1200,
      height: 700,
      minWidth: 900,
      minHeight: 600,
      frame: false,
      titleBarStyle: "hidden",
      // backgroundColor: "#f8fafc",
      backgroundMaterial: "acrylic",
      icon: path.join(__dirname, "../resources/icon.png"),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
      },
      show: false,
    });

    win.once("ready-to-show", () => {
      win.show();
    });

    // Setup all handlers
    setupWindowHandlers(win);
    setupWallpaperHandlers();
    setupRainmeterHandlers();
    setupWallhavenHandlers();
    setupUpdateHandlers(win);

    if (app.isPackaged) {
      appServe(win).then(() => {
        win.loadURL("app://-");
      });
    } else {
      // Try to connect to Next.js dev server on different ports
      const tryPorts = [3000, 3001, 3002];
      let currentPortIndex = 0;

      const loadDevServer = () => {
        const port = tryPorts[currentPortIndex];
        const devUrl = `http://localhost:${port}`;

        console.log(
          `Attempting to connect to Next.js dev server on port ${port}...`
        );
        win.loadURL(devUrl);
      };

      // Initial load attempt
      loadDevServer();

      // Handle load failures by trying the next port
      win.webContents.on("did-fail-load", (e, code, desc) => {
        console.log(
          `Failed to load on port ${tryPorts[currentPortIndex]}: ${desc}`
        );

        currentPortIndex++;
        if (currentPortIndex < tryPorts.length) {
          // Try next port
          setTimeout(() => {
            loadDevServer();
          }, 1000);
        } else {
          // All ports failed, reset and try again
          console.log("All ports failed, retrying in 3 seconds...");
          currentPortIndex = 0;
          setTimeout(() => {
            loadDevServer();
          }, 3000);
        }
      });

      // Open dev tools only after successful load
      win.webContents.once("did-finish-load", () => {
        console.log(
          `Successfully connected to Next.js dev server on port ${tryPorts[currentPortIndex]}`
        );
        // win.webContents.openDevTools(); // Removed auto-opening of dev tools
      });
    }
  };

  app.on("ready", () => {
    createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Helper function to get folder size
  async function getFolderSize(folderPath) {
    try {
      let totalSize = 0;

      const items = fs.readdirSync(folderPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(folderPath, item.name);

        if (item.isDirectory()) {
          totalSize += await getFolderSize(itemPath);
        } else {
          const stats = fs.statSync(itemPath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error("Error calculating folder size:", error);
      return 0;
    }
  }

  // Helper function to remove directory recursively
  async function removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          await removeDirectory(itemPath);
        } else {
          fs.unlinkSync(itemPath);
        }
      }

      fs.rmdirSync(dirPath);
    }
  }

  // Wallhaven API Configuration
  const WALLHAVEN_CONFIG = {
    BASE_URL: "https://wallhaven.cc/api/v1",
    API_KEY: "6hD9gTaTNnsq9bWXPbyjugN0QSrT76hi",
    ENDPOINTS: {
      SEARCH: "/search",
      WALLPAPER: "/w",
      TAG: "/tag",
      COLLECTIONS: "/collections",
      SETTINGS: "/settings",
    },
    DEFAULT_PARAMS: {
      PER_PAGE: 24,
      CATEGORIES: "100",
      PURITY: "100",
      SORTING: "date_added",
      ORDER: "desc",
    },
    RATE_LIMIT: 45,
  };

  // Helper function to make HTTP requests
  function makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Desktop Pro/1.0.0",
          ...options.headers,
        },
      };

      const req = https.request(requestOptions, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error("Invalid JSON response"));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.setTimeout(options.timeout || 10000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      req.end();
    });
  }
}
