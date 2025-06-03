const { ipcRenderer } = require("electron");

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
};

module.exports = { wallpaperAPI };
