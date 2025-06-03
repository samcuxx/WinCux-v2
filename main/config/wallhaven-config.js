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

module.exports = { WALLHAVEN_CONFIG };
