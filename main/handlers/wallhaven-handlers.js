const { ipcMain } = require("electron");
const { WALLHAVEN_CONFIG } = require("../config/wallhaven-config");
const { makeHttpRequest } = require("../utils/http-utils");

function setupWallhavenHandlers() {
  // Search wallpapers
  ipcMain.handle("wallhaven-search", async (event, params = {}) => {
    try {
      const searchParams = {
        ...WALLHAVEN_CONFIG.DEFAULT_PARAMS,
        ...params,
      };

      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      // Add API key if available
      if (WALLHAVEN_CONFIG.API_KEY) {
        queryParams.append("apikey", WALLHAVEN_CONFIG.API_KEY);
      }

      const url = `${WALLHAVEN_CONFIG.BASE_URL}${
        WALLHAVEN_CONFIG.ENDPOINTS.SEARCH
      }?${queryParams.toString()}`;
      console.log("Wallhaven API request:", url);

      const response = await makeHttpRequest(url);
      return response;
    } catch (error) {
      console.error("Wallhaven search error:", error);
      throw error;
    }
  });

  // Get wallpaper by ID
  ipcMain.handle("wallhaven-wallpaper", async (event, id) => {
    try {
      const queryParams = new URLSearchParams();
      if (WALLHAVEN_CONFIG.API_KEY) {
        queryParams.append("apikey", WALLHAVEN_CONFIG.API_KEY);
      }

      const url = `${WALLHAVEN_CONFIG.BASE_URL}${
        WALLHAVEN_CONFIG.ENDPOINTS.WALLPAPER
      }/${id}?${queryParams.toString()}`;
      console.log("Wallhaven wallpaper request:", url);

      const response = await makeHttpRequest(url);
      return response;
    } catch (error) {
      console.error("Wallhaven wallpaper error:", error);
      throw error;
    }
  });

  // Get tag info
  ipcMain.handle("wallhaven-tag", async (event, tagId) => {
    try {
      const queryParams = new URLSearchParams();
      if (WALLHAVEN_CONFIG.API_KEY) {
        queryParams.append("apikey", WALLHAVEN_CONFIG.API_KEY);
      }

      const url = `${WALLHAVEN_CONFIG.BASE_URL}${
        WALLHAVEN_CONFIG.ENDPOINTS.TAG
      }/${tagId}?${queryParams.toString()}`;
      console.log("Wallhaven tag request:", url);

      const response = await makeHttpRequest(url);
      return response;
    } catch (error) {
      console.error("Wallhaven tag error:", error);
      throw error;
    }
  });

  // Get user settings (requires API key)
  ipcMain.handle("wallhaven-settings", async (event) => {
    try {
      if (!WALLHAVEN_CONFIG.API_KEY) {
        throw new Error("API key required for settings");
      }

      const queryParams = new URLSearchParams();
      queryParams.append("apikey", WALLHAVEN_CONFIG.API_KEY);

      const url = `${WALLHAVEN_CONFIG.BASE_URL}${
        WALLHAVEN_CONFIG.ENDPOINTS.SETTINGS
      }?${queryParams.toString()}`;
      console.log("Wallhaven settings request:", url);

      const response = await makeHttpRequest(url);
      return response;
    } catch (error) {
      console.error("Wallhaven settings error:", error);
      throw error;
    }
  });

  // Test API configuration
  ipcMain.handle("wallhaven-test", async (event) => {
    try {
      return {
        config: {
          baseUrl: WALLHAVEN_CONFIG.BASE_URL,
          hasApiKey: !!WALLHAVEN_CONFIG.API_KEY,
          apiKeyLength: WALLHAVEN_CONFIG.API_KEY?.length || 0,
        },
        status: "ready",
      };
    } catch (error) {
      console.error("Wallhaven test error:", error);
      throw error;
    }
  });
}

module.exports = { setupWallhavenHandlers };
