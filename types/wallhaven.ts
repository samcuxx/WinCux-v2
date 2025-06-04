// Wallhaven API Types based on official documentation

export interface WallhavenWallpaper {
  id: string;
  url: string;
  short_url: string;
  views: number;
  favorites: number;
  source: string;
  purity: "sfw" | "sketchy" | "nsfw";
  category: "general" | "anime" | "people";
  dimension_x: number;
  dimension_y: number;
  resolution: string;
  ratio: string;
  file_size: number;
  file_type: string;
  created_at: string;
  colors: string[];
  path: string;
  thumbs: {
    large: string;
    original: string;
    small: string;
  };
  uploader?: {
    username: string;
    group: string;
    avatar: {
      "200px": string;
      "128px": string;
      "32px": string;
      "20px": string;
    };
  };
  tags?: WallhavenTag[];
}

export interface WallhavenTag {
  id: number;
  name: string;
  alias: string;
  category_id: number;
  category: string;
  purity: "sfw" | "sketchy" | "nsfw";
  created_at: string;
}

export interface WallhavenSearchResponse {
  data: WallhavenWallpaper[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    query?:
      | string
      | {
          id: number;
          tag: string;
        };
    seed?: string;
  };
}

export interface WallhavenWallpaperResponse {
  data: WallhavenWallpaper;
}

export interface WallhavenTagResponse {
  data: WallhavenTag;
}

export interface WallhavenCollection {
  id: number;
  label: string;
  views: number;
  public: 0 | 1;
  count: number;
}

export interface WallhavenCollectionsResponse {
  data: WallhavenCollection[];
}

export interface WallhavenUserSettings {
  thumb_size: string;
  per_page: string;
  purity: string[];
  categories: string[];
  resolutions: string[];
  aspect_ratios: string[];
  toplist_range: string;
  tag_blacklist: string[];
  user_blacklist: string[];
}

export interface WallhavenUserSettingsResponse {
  data: WallhavenUserSettings;
}

export interface WallhavenSearchParams {
  q?: string; // search query
  categories?: string; // 100/101/111 etc (general/anime/people)
  purity?: string; // 100/110/111 etc (sfw/sketchy/nsfw)
  sorting?:
    | "date_added"
    | "relevance"
    | "random"
    | "views"
    | "favorites"
    | "toplist";
  order?: "desc" | "asc";
  topRange?: "1d" | "3d" | "1w" | "1M" | "3M" | "6M" | "1y";
  atleast?: string; // minimum resolution e.g., "1920x1080"
  resolutions?: string; // exact resolutions
  ratios?: string; // aspect ratios
  colors?: string; // color palette
  page?: number;
  seed?: string; // for random results
  apikey?: string;
}

// Extended search options interface for frontend filters
export interface ExtendedSearchOptions {
  q?: string;
  categories?: string;
  purity?: string;
  sorting?:
    | "date_added"
    | "relevance"
    | "random"
    | "views"
    | "favorites"
    | "toplist";
  order?: "desc" | "asc";
  atleast?: string;
  resolutions?: string[];
  ratios?: string[];
  colors?: string[];
  page?: number;
}

// Local wallpaper type for compatibility with existing components
export interface LocalWallpaper {
  id: string;
  title: string;
  description: string;
  category: string;
  resolution: string;
  size: string;
  downloads: number;
  rating: number;
  tags: string[];
  author: string;
  dateAdded: string;
  colors: string[];
  thumbnail: string;
  preview: string;
  fullRes: string;
  source: "wallhaven" | "unsplash" | "local";
  sourceId: string;
  purity?: "sfw" | "sketchy" | "nsfw";
  views?: number;
  favorites?: number;
}

// Mapping function type
export type WallhavenToLocalMapper = (
  wallhaven: WallhavenWallpaper
) => LocalWallpaper;

// Search filter types
export interface WallpaperFilters {
  category: string;
  purity: string;
  sorting: string;
  order: string;
  minResolution?: string;
  colors?: string[];
  ratios?: string[];
}

// API request options
export interface WallhavenRequestOptions {
  useApiKey?: boolean;
  timeout?: number;
  retries?: number;
}

// Rate limiting
export interface RateLimit {
  remaining: number;
  reset: number;
  limit: number;
}
