import {
  WallhavenWallpaper,
  WallhavenSearchResponse,
  WallhavenWallpaperResponse,
  WallhavenTagResponse,
  WallhavenCollectionsResponse,
  WallhavenUserSettingsResponse,
  WallhavenSearchParams,
  WallhavenRequestOptions,
  LocalWallpaper,
  RateLimit,
} from "@/types/wallhaven";
import { WALLHAVEN_CONFIG } from "@/lib/config/wallhaven";

export class WallhavenAPIService {
  private baseUrl: string;
  private apiKey?: string;
  private rateLimit: RateLimit | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(apiKey?: string) {
    // Use IPC for Electron app
    this.baseUrl = "wallhaven"; // IPC channel prefix
    this.apiKey = apiKey || WALLHAVEN_CONFIG.API_KEY;
  }

  /**
   * Rate limiting and request queue management
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
          // Small delay between requests to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 1500)); // ~40 requests per minute
        } catch (error) {
          console.error("Queue request failed:", error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Get rate limit information
   */
  getRateLimit(): RateLimit | null {
    return this.rateLimit;
  }

  /**
   * Update rate limit from response headers
   */
  private updateRateLimit(headers?: Headers): void {
    if (!headers) return;

    const limit = headers.get("X-Ratelimit-Limit");
    const remaining = headers.get("X-Ratelimit-Remaining");
    const reset = headers.get("X-Ratelimit-Reset");

    if (limit && remaining && reset) {
      this.rateLimit = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset) * 1000,
      };
    }
  }

  /**
   * Make IPC request with rate limiting and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {},
    options: WallhavenRequestOptions = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          // Check if we're in Electron environment
          if (typeof window !== "undefined" && (window as any).electronAPI) {
            const electronAPI = (window as any).electronAPI;
            let response;

            // Map endpoints to specific API methods
            switch (endpoint) {
              case "/search":
                response = await electronAPI.wallhavenSearch(params);
                break;
              case "/settings":
                response = await electronAPI.wallhavenSettings();
                break;
              default:
                if (endpoint.startsWith("/wallpaper/")) {
                  const id = endpoint.split("/")[2];
                  response = await electronAPI.wallhavenWallpaper(id);
                } else if (endpoint.startsWith("/tag/")) {
                  const tagId = endpoint.split("/")[2];
                  response = await electronAPI.wallhavenTag(tagId);
                } else {
                  throw new Error(`Unsupported endpoint: ${endpoint}`);
                }
            }

            resolve(response);
          } else {
            // Fallback for non-Electron environments (development)
            reject(new Error("Electron API not available"));
          }
        } catch (error: any) {
          console.error(`API request failed for ${endpoint}:`, error);
          reject(new WallhavenAPIError(error.message || "Request failed", 500));
        }
      };

      // Add to queue for rate limiting
      this.requestQueue.push(executeRequest);
      this.processQueue();
    });
  }

  /**
   * Search wallpapers with advanced filtering
   */
  async searchWallpapers(
    params: WallhavenSearchParams = {},
    options: WallhavenRequestOptions = {}
  ): Promise<WallhavenSearchResponse> {
    const searchParams = {
      ...WALLHAVEN_CONFIG.DEFAULT_PARAMS,
      ...params,
    };

    return this.makeRequest<WallhavenSearchResponse>(
      "/search",
      searchParams,
      options
    );
  }

  /**
   * Get specific wallpaper by ID
   */
  async getWallpaper(
    id: string,
    options: WallhavenRequestOptions = {}
  ): Promise<WallhavenWallpaperResponse> {
    return this.makeRequest<WallhavenWallpaperResponse>(
      `/wallpaper/${id}`,
      {},
      options
    );
  }

  /**
   * Get tag information
   */
  async getTag(
    id: number,
    options: WallhavenRequestOptions = {}
  ): Promise<WallhavenTagResponse> {
    return this.makeRequest<WallhavenTagResponse>(`/tag/${id}`, {}, options);
  }

  /**
   * Get user collections (requires API key)
   */
  async getUserCollections(
    options: WallhavenRequestOptions = {}
  ): Promise<WallhavenCollectionsResponse> {
    return this.makeRequest<WallhavenCollectionsResponse>(
      "/collections",
      {},
      options
    );
  }

  /**
   * Get public collections for a user
   */
  async getPublicCollections(
    username: string,
    options: WallhavenRequestOptions = {}
  ): Promise<WallhavenCollectionsResponse> {
    return this.makeRequest<WallhavenCollectionsResponse>(
      `/collections/${username}`,
      {},
      options
    );
  }

  /**
   * Get wallpapers from a collection
   */
  async getCollectionWallpapers(
    username: string,
    collectionId: number,
    params: Partial<WallhavenSearchParams> = {},
    options: WallhavenRequestOptions = {}
  ): Promise<WallhavenSearchResponse> {
    return this.makeRequest<WallhavenSearchResponse>(
      `/collections/${username}/${collectionId}`,
      params,
      options
    );
  }

  /**
   * Get user settings (requires API key)
   */
  async getUserSettings(
    options: WallhavenRequestOptions = {}
  ): Promise<WallhavenUserSettingsResponse> {
    return this.makeRequest<WallhavenUserSettingsResponse>(
      "/settings",
      {},
      options
    );
  }

  /**
   * Convert Wallhaven wallpaper to local format
   */
  mapToLocalWallpaper(wallhaven: WallhavenWallpaper): LocalWallpaper {
    return {
      id: wallhaven.id,
      title: this.generateTitle(wallhaven),
      description: this.generateDescription(wallhaven),
      category: this.mapCategory(wallhaven.category),
      resolution: wallhaven.resolution,
      size: this.formatFileSize(wallhaven.file_size),
      downloads: wallhaven.views, // Using views as downloads equivalent
      rating: this.calculateRating(wallhaven),
      tags: wallhaven.tags?.map((tag) => tag.name) || [],
      author: wallhaven.uploader?.username || "Unknown",
      dateAdded: wallhaven.created_at,
      colors: wallhaven.colors,
      thumbnail: wallhaven.thumbs.large,
      preview: wallhaven.thumbs.original,
      fullRes: wallhaven.path,
      source: "wallhaven",
      sourceId: wallhaven.id,
      purity: wallhaven.purity,
      views: wallhaven.views,
      favorites: wallhaven.favorites,
    };
  }

  /**
   * Search and convert to local format
   */
  async searchAndMapWallpapers(
    params: WallhavenSearchParams = {},
    options: WallhavenRequestOptions = {}
  ): Promise<{ wallpapers: LocalWallpaper[]; meta: any }> {
    try {
      const response = await this.searchWallpapers(params, options);
      const wallpapers = response.data.map((w) => this.mapToLocalWallpaper(w));

      return {
        wallpapers,
        meta: response.meta,
      };
    } catch (error) {
      console.error("Search and map error:", error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private generateTitle(wallpaper: WallhavenWallpaper): string {
    if (wallpaper.tags && wallpaper.tags.length > 0) {
      return (
        wallpaper.tags[0].name.charAt(0).toUpperCase() +
        wallpaper.tags[0].name.slice(1)
      );
    }
    return `${
      wallpaper.category.charAt(0).toUpperCase() + wallpaper.category.slice(1)
    } Wallpaper`;
  }

  private generateDescription(wallpaper: WallhavenWallpaper): string {
    const category =
      wallpaper.category.charAt(0).toUpperCase() + wallpaper.category.slice(1);
    const tags =
      wallpaper.tags
        ?.slice(0, 3)
        .map((tag) => tag.name)
        .join(", ") || "";
    return `${category} wallpaper${tags ? ` featuring ${tags}` : ""} in ${
      wallpaper.resolution
    } resolution`;
  }

  private mapCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      general: "Nature",
      anime: "Anime",
      people: "People",
    };
    return categoryMap[category] || "General";
  }

  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  private calculateRating(wallpaper: WallhavenWallpaper): number {
    // Simple rating calculation based on views and favorites
    const viewsScore = Math.min(wallpaper.views / 1000, 5);
    const favoritesScore = Math.min(wallpaper.favorites / 100, 5);
    return Math.round(((viewsScore + favoritesScore) / 2) * 10) / 10;
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.getUserSettings();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Custom error class
class WallhavenAPIError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "WallhavenAPIError";
    this.status = status;
  }
}

// Singleton instance
export const wallhavenAPI = new WallhavenAPIService();
