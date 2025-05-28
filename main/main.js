const { app, BrowserWindow, ipcMain, shell } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const { TbBackground } = require("react-icons/tb");
const fs = require("fs");
const https = require("https");
const os = require("os");

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
    icon: path.join(__dirname, "../public/favicon.ico"),
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

  // Download wallpaper functionality
  ipcMain.handle("download-wallpaper", async (event, { url, filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");

      // Create Wallpapers folder if it doesn't exist
      if (!fs.existsSync(picturesPath)) {
        fs.mkdirSync(picturesPath, { recursive: true });
      }

      const filePath = path.join(picturesPath, filename);

      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        https
          .get(url, (response) => {
            response.pipe(file);

            file.on("finish", () => {
              file.close();
              resolve({ success: true, path: filePath });
            });

            file.on("error", (err) => {
              fs.unlink(filePath, () => {}); // Delete the file on error
              reject({ success: false, error: err.message });
            });
          })
          .on("error", (err) => {
            reject({ success: false, error: err.message });
          });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Check if wallpaper file exists
  ipcMain.handle("check-wallpaper-exists", async (event, { filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");
      const filePath = path.join(picturesPath, filename);

      const exists = fs.existsSync(filePath);
      return { exists, path: exists ? filePath : null };
    } catch (error) {
      return { exists: false, path: null, error: error.message };
    }
  });

  // Set wallpaper functionality
  ipcMain.handle("set-wallpaper", async (event, { url, filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");

      // Create Wallpapers folder if it doesn't exist
      if (!fs.existsSync(picturesPath)) {
        fs.mkdirSync(picturesPath, { recursive: true });
      }

      const filePath = path.join(picturesPath, filename);

      // Check if file already exists
      if (!fs.existsSync(filePath)) {
        // Download the image only if it doesn't exist
        await new Promise((resolve, reject) => {
          const file = fs.createWriteStream(filePath);

          https
            .get(url, (response) => {
              response.pipe(file);

              file.on("finish", () => {
                file.close();
                resolve();
              });

              file.on("error", (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
              });
            })
            .on("error", (err) => {
              reject(err);
            });
        });
      }

      // Set as wallpaper based on platform
      if (process.platform === "win32") {
        const { exec } = require("child_process");

        // Validate that the file exists and is a supported format
        if (!fs.existsSync(filePath)) {
          return { success: false, error: "Downloaded file not found" };
        }

        // Ensure we have the absolute path
        const absolutePath = path.resolve(filePath);
        console.log("Absolute file path:", absolutePath);

        // Check file size to ensure it's not corrupted
        const stats = fs.statSync(absolutePath);
        if (stats.size < 1000) {
          // Less than 1KB is probably corrupted
          return {
            success: false,
            error: "Downloaded file appears to be corrupted",
          };
        }

        // Use a simpler PowerShell approach that's more reliable
        const escapedPath = absolutePath.replace(/'/g, "''");
        const command = `powershell.exe -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Wallpaper { [DllImport(\\"user32.dll\\", CharSet=CharSet.Auto)] static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); public static void SetWallpaper(string path) { SystemParametersInfo(20, 0, path, 3); } }'; [Wallpaper]::SetWallpaper('${escapedPath}')"`;

        console.log("Setting wallpaper with command:", command);
        console.log("File path:", absolutePath);
        console.log("File size:", stats.size, "bytes");

        return new Promise((resolve, reject) => {
          exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
            console.log("PowerShell stdout:", stdout);
            console.log("PowerShell stderr:", stderr);

            if (error) {
              console.error("PowerShell error:", error);

              // Fallback: Try using registry method
              const registryCommand = `powershell.exe -Command "Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name Wallpaper -Value '${escapedPath}'; rundll32.exe user32.dll,UpdatePerUserSystemParameters"`;

              console.log("Trying registry fallback:", registryCommand);

              exec(
                registryCommand,
                { timeout: 10000 },
                (fallbackError, fallbackStdout, fallbackStderr) => {
                  if (fallbackError) {
                    console.error("Registry fallback error:", fallbackError);

                    // Second fallback: Try using a different approach with RUNDLL32
                    const rundllCommand = `rundll32.exe user32.dll,SystemParametersInfoA 20 0 "${absolutePath}" 3`;

                    console.log("Trying rundll32 fallback:", rundllCommand);

                    exec(rundllCommand, { timeout: 10000 }, (rundllError) => {
                      if (rundllError) {
                        console.error("Rundll32 fallback error:", rundllError);
                        reject({
                          success: false,
                          error: `All wallpaper methods failed. Last error: ${rundllError.message}`,
                        });
                      } else {
                        console.log("Rundll32 method successful");
                        resolve({
                          success: true,
                          path: absolutePath,
                          method: "rundll32",
                        });
                      }
                    });
                  } else {
                    console.log("Registry method successful");
                    resolve({
                      success: true,
                      path: absolutePath,
                      method: "registry",
                    });
                  }
                }
              );
            } else {
              console.log("SystemParametersInfo method successful");
              resolve({
                success: true,
                path: absolutePath,
                method: "systemparametersinfo",
              });
            }
          });
        });
      } else if (process.platform === "darwin") {
        const { exec } = require("child_process");
        const command = `osascript -e "tell application \\"Finder\\" to set desktop picture to POSIX file \\"${filePath}\\""`;

        return new Promise((resolve, reject) => {
          exec(command, (error) => {
            if (error) {
              reject({ success: false, error: error.message });
            } else {
              resolve({ success: true, path: filePath });
            }
          });
        });
      } else {
        // Linux
        const { exec } = require("child_process");
        const command = `gsettings set org.gnome.desktop.background picture-uri "file://${filePath}"`;

        return new Promise((resolve, reject) => {
          exec(command, (error) => {
            if (error) {
              reject({ success: false, error: error.message });
            } else {
              resolve({ success: true, path: filePath });
            }
          });
        });
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
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
