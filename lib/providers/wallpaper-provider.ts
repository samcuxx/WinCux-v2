import {
  LocalWallpaper,
  WallhavenSearchParams,
  WallhavenSearchResponse,
} from "@/types/wallhaven";
import { wallhavenAPI } from "@/lib/services/wallhaven-api";
import { wallpaperCache } from "@/lib/services/wallpaper-cache";

export interface WallpaperSource {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresApiKey: boolean;
}

export interface SearchOptions {
  query?: string;
  category?: string;
  sorting?:
    | "date_added"
    | "toplist"
    | "views"
    | "favorites"
    | "random"
    | "relevance";
  order?: "desc" | "asc";
  page?: number;
}

export interface SearchResult {
  wallpapers: LocalWallpaper[];
  totalCount: number;
  hasNextPage: boolean;
  isFromCache: boolean;
  cacheAge?: number;
}

class WallpaperProvider {
  private sources: Map<string, WallpaperSource> = new Map();
  private readonly defaultOptions: Required<SearchOptions> = {
    query: "",
    category: "All",
    sorting: "date_added",
    order: "desc",
    page: 1,
  };

  constructor() {
    this.initializeSources();
  }

  private initializeSources(): void {
    // Register Wallhaven as primary source
    this.registerSource({
      id: "wallhaven",
      name: "Wallhaven",
      description: "High-quality wallpapers from Wallhaven.cc",
      enabled: true,
      requiresApiKey: true,
    });

    // Future sources can be added here
    this.registerSource({
      id: "unsplash",
      name: "Unsplash",
      description: "Professional photography from Unsplash",
      enabled: false, // Not implemented yet
      requiresApiKey: true,
    });

    this.registerSource({
      id: "local",
      name: "Local Storage",
      description: "Wallpapers saved locally",
      enabled: false, // Not implemented yet
      requiresApiKey: false,
    });
  }

  /**
   * Register a new wallpaper source
   */
  registerSource(source: WallpaperSource): void {
    this.sources.set(source.id, source);
  }

  /**
   * Get all available sources
   */
  getSources(): WallpaperSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Get enabled sources
   */
  getEnabledSources(): WallpaperSource[] {
    return Array.from(this.sources.values()).filter((source) => source.enabled);
  }

  /**
   * Get source status
   */
  async getSourceStatus(): Promise<
    Array<{
      source: WallpaperSource;
      status: "connected" | "error" | "disabled";
    }>
  > {
    const results = [];

    for (const source of Array.from(this.sources.values())) {
      if (!source.enabled) {
        results.push({ source, status: "disabled" as const });
        continue;
      }

      try {
        const isValid = await this.validateSource(source.id);
        results.push({
          source,
          status: isValid ? ("connected" as const) : ("error" as const),
        });
      } catch (error) {
        results.push({ source, status: "error" as const });
      }
    }

    return results;
  }

  /**
   * Validate source configuration
   */
  async validateSource(sourceId: string): Promise<boolean> {
    const source = this.sources.get(sourceId);
    if (!source) return false;

    switch (sourceId) {
      case "wallhaven":
        return await wallhavenAPI.validateApiKey();
      default:
        return true;
    }
  }

  /**
   * Get initial cached data for app startup
   */
  async getInitialData(): Promise<SearchResult | null> {
    try {
      const cachedData = wallpaperCache.getRecentCache();

      if (cachedData) {
        const cacheAge = Date.now() - cachedData.timestamp;
        return {
          wallpapers: cachedData.data,
          totalCount: cachedData.totalCount,
          hasNextPage: cachedData.hasNextPage,
          isFromCache: true,
          cacheAge,
        };
      }

      return null;
    } catch (error) {
      console.warn("Failed to get initial cached data:", error);
      return null;
    }
  }

  async search(options: SearchOptions = {}): Promise<SearchResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const { query, category, sorting, order, page } = mergedOptions;

    // Normalize parameters
    const normalizedQuery = query?.trim() || "";
    const normalizedCategory = category === "All" ? "" : category;

    try {
      // First, try to get from cache
      const cachedResult = wallpaperCache.get(
        normalizedQuery,
        normalizedCategory,
        sorting,
        page
      );

      if (cachedResult) {
        const cacheAge = Date.now() - cachedResult.timestamp;
        console.log(
          `Using cached data (${Math.round(cacheAge / 1000)}s old) for:`,
          {
            query: normalizedQuery,
            category: normalizedCategory,
            sorting,
            page,
          }
        );

        // Start background refresh if cache is getting old (15+ minutes)
        if (cacheAge > 15 * 60 * 1000) {
          this.backgroundRefresh(
            normalizedQuery,
            normalizedCategory,
            sorting,
            order,
            page
          );
        }

        return {
          wallpapers: cachedResult.data,
          totalCount: cachedResult.totalCount,
          hasNextPage: cachedResult.hasNextPage,
          isFromCache: true,
          cacheAge,
        };
      }

      // If not in cache, fetch from API
      console.log("Fetching fresh data from API for:", {
        query: normalizedQuery,
        category: normalizedCategory,
        sorting,
        page,
      });

      const response = await this.fetchFromAPI(
        normalizedQuery,
        normalizedCategory,
        sorting,
        order,
        page
      );

      // Cache the result
      wallpaperCache.set(
        normalizedQuery,
        normalizedCategory,
        sorting,
        page,
        response.wallpapers,
        response.totalCount,
        response.hasNextPage
      );

      return {
        ...response,
        isFromCache: false,
      };
    } catch (error) {
      console.error("Search failed:", error);

      // Try to return stale cache as fallback
      const staleCache = wallpaperCache.get(
        normalizedQuery,
        normalizedCategory,
        sorting,
        page
      );
      if (staleCache) {
        console.log("Using stale cache as fallback");
        return {
          wallpapers: staleCache.data,
          totalCount: staleCache.totalCount,
          hasNextPage: staleCache.hasNextPage,
          isFromCache: true,
          cacheAge: Date.now() - staleCache.timestamp,
        };
      }

      throw error;
    }
  }

  async loadMore(options: SearchOptions = {}): Promise<SearchResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const { query, category, sorting, order } = mergedOptions;
    const nextPage = (options.page || 1) + 1;

    const normalizedQuery = query?.trim() || "";
    const normalizedCategory = category === "All" ? "" : category;

    try {
      // Check if next page is already cached
      const cachedResult = wallpaperCache.get(
        normalizedQuery,
        normalizedCategory,
        sorting,
        nextPage
      );

      if (cachedResult) {
        return {
          wallpapers: cachedResult.data,
          totalCount: cachedResult.totalCount,
          hasNextPage: cachedResult.hasNextPage,
          isFromCache: true,
          cacheAge: Date.now() - cachedResult.timestamp,
        };
      }

      // Fetch next page from API
      const response = await this.fetchFromAPI(
        normalizedQuery,
        normalizedCategory,
        sorting,
        order,
        nextPage
      );

      // Append to existing cache
      wallpaperCache.appendToCache(
        normalizedQuery,
        normalizedCategory,
        sorting,
        nextPage,
        response.wallpapers,
        response.totalCount,
        response.hasNextPage
      );

      return {
        ...response,
        isFromCache: false,
      };
    } catch (error) {
      console.error("Load more failed:", error);
      throw error;
    }
  }

  private async fetchFromAPI(
    query: string,
    category: string,
    sorting: string,
    order: string,
    page: number
  ): Promise<SearchResult> {
    const searchParams: WallhavenSearchParams = {
      page,
      sorting: sorting as any,
      order: order as any,
    };

    if (query) {
      searchParams.q = query;
    }

    if (category) {
      // Map categories to Wallhaven API format
      const categoryMap: Record<string, string> = {
        General: "100",
        Anime: "010",
        People: "001",
      };
      searchParams.categories = categoryMap[category] || "111";
    }

    const response: WallhavenSearchResponse =
      await wallhavenAPI.searchWallpapers(searchParams);

    const wallpapers: LocalWallpaper[] = response.data.map((item) =>
      wallhavenAPI.mapToLocalWallpaper(item)
    );

    return {
      wallpapers,
      totalCount: response.meta.total || 0,
      hasNextPage: response.meta.current_page < response.meta.last_page,
      isFromCache: false,
    };
  }

  // Background refresh without blocking UI
  private async backgroundRefresh(
    query: string,
    category: string,
    sorting: string,
    order: string,
    page: number
  ): Promise<void> {
    try {
      console.log("Starting background refresh for cached data");
      const response = await this.fetchFromAPI(
        query,
        category,
        sorting,
        order,
        page
      );

      // Update cache with fresh data
      wallpaperCache.set(
        query,
        category,
        sorting,
        page,
        response.wallpapers,
        response.totalCount,
        response.hasNextPage
      );

      console.log("Background refresh completed");
    } catch (error) {
      console.warn("Background refresh failed:", error);
    }
  }

  /**
   * Get trending/popular wallpapers
   */
  async getTrendingWallpapers(
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    return this.search({
      ...options,
      sorting: "toplist",
      order: "desc",
    });
  }

  /**
   * Get latest wallpapers
   */
  async getLatestWallpapers(
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    return this.search({
      ...options,
      sorting: "date_added",
      order: "desc",
    });
  }

  /**
   * Get random wallpapers
   */
  async getRandomWallpapers(
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    return this.search({
      ...options,
      sorting: "random",
    });
  }

  /**
   * Get wallpaper by ID from specific source
   */
  async getWallpaperById(
    id: string,
    source: string = "wallhaven"
  ): Promise<LocalWallpaper | null> {
    try {
      switch (source) {
        case "wallhaven":
          const response = await wallhavenAPI.getWallpaper(id);
          return wallhavenAPI.mapToLocalWallpaper(response.data);
        default:
          console.warn(`Source ${source} not implemented for getWallpaperById`);
          return null;
      }
    } catch (error) {
      console.error(`Error getting wallpaper ${id} from ${source}:`, error);
      return null;
    }
  }

  /**
   * Get categories from all sources
   */
  getAvailableCategories(): string[] {
    return ["All", "General", "Anime", "People"];
  }

  /**
   * Get sorting options
   */
  getSortingOptions(): Array<{ value: string; label: string }> {
    return [
      { value: "date_added", label: "Latest" },
      { value: "toplist", label: "Top Rated" },
      { value: "views", label: "Most Viewed" },
      { value: "favorites", label: "Most Favorited" },
      { value: "random", label: "Random" },
      { value: "relevance", label: "Relevance" },
    ];
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Cache management methods
  getCacheStats() {
    return wallpaperCache.getCacheStats();
  }

  clearCache(): void {
    wallpaperCache.clearAllCache();
  }
}

// Singleton instance
export const wallpaperProvider = new WallpaperProvider();
