const { ipcRenderer } = require("electron");

const wallhavenAPI = {
  // Wallhaven API
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  wallhavenSearch: (params) => ipcRenderer.invoke("wallhaven-search", params),
  wallhavenWallpaper: (id) => ipcRenderer.invoke("wallhaven-wallpaper", id),
  wallhavenTag: (tagId) => ipcRenderer.invoke("wallhaven-tag", tagId),
  wallhavenSettings: () => ipcRenderer.invoke("wallhaven-settings"),
  wallhavenTest: () => ipcRenderer.invoke("wallhaven-test"),
};

module.exports = { wallhavenAPI };
