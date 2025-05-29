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
    // Use local API routes instead of direct Wallhaven API
    this.baseUrl = "/api/wallhaven";
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
   * Make HTTP request with rate limiting and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {},
    options: WallhavenRequestOptions = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          // Construct the full URL to our API route
          const url = new URL(
            `${this.baseUrl}${endpoint}`,
            window.location.origin
          );

          // Add query parameters
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, value.toString());
            }
          });

          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, options.timeout || 10000);

          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new WallhavenAPIError(
              errorData.error ||
                `HTTP ${response.status}: ${response.statusText}`,
              response.status
            );
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          if (error instanceof WallhavenAPIError) {
            reject(error);
          } else if (
            error &&
            typeof error === "object" &&
            "name" in error &&
            error.name === "AbortError"
          ) {
            reject(new WallhavenAPIError("Request timeout", 408));
          } else {
            reject(
              new WallhavenAPIError(
                error &&
                typeof error === "object" &&
                "message" in error &&
                typeof error.message === "string"
                  ? error.message
                  : "Network error occurred"
              )
            );
          }
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
   * Get current rate limit status
   */
  getRateLimit(): RateLimit | null {
    return this.rateLimit;
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
