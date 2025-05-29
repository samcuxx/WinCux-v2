// Wallhaven API Configuration
export const WALLHAVEN_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_WALLHAVEN_BASE_URL || "https://wallhaven.cc/api/v1",
  API_KEY:
    process.env.NEXT_PUBLIC_WALLHAVEN_API_KEY ||
    "6hD9gTaTNnsq9bWXPbyjugN0QSrT76hi",
  ENDPOINTS: {
    SEARCH: "/search",
    WALLPAPER: "/w",
    TAG: "/tag",
    COLLECTIONS: "/collections",
    SETTINGS: "/settings",
  },
  DEFAULT_PARAMS: {
    PER_PAGE: 24,
    CATEGORIES: "100", // all categories (general/anime/people)
    PURITY: "100", // sfw only by default
    SORTING: "date_added",
    ORDER: "desc",
  },
  RATE_LIMIT: 45, // requests per minute
} as const;

export type WallhavenConfig = typeof WALLHAVEN_CONFIG;
