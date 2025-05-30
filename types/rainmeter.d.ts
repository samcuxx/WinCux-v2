export interface RainmeterSkin {
  id: string;
  url: string;
  name: string;
  description: string;
  thumbnail_url: string;
  download_url: string;
  tags: string[];
  rating: number;
  votes: number;
  developer: string;
  category: string;
  downloads: number;
  file_size: string;
  last_updated: string;
  version: string;
  scraped_at: string;
  content_hash: string;
}

export interface SkinSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  developer?: string;
  sorting?: "name" | "rating" | "downloads" | "last_updated" | "file_size";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SkinSearchResponse {
  skins: RainmeterSkin[];
  totalCount: number;
  hasNextPage: boolean;
  page: number;
}

export interface SkinInstallStatus {
  skinId: string;
  isInstalled: boolean;
  isEnabled: boolean;
  installPath?: string;
  installedAt?: string;
  version?: string;
}

export interface SkinConfiguration {
  skinId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  alwaysOnTop: boolean;
  clickThrough: boolean;
  keepOnScreen: boolean;
  customVariables?: Record<string, string>;
}
