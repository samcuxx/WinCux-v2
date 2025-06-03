const { ipcRenderer } = require("electron");

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

module.exports = { rainmeterAPI };
