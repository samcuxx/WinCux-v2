import { LocalWallpaper } from "@/types/wallhaven";

interface CacheEntry {
  data: LocalWallpaper[];
  timestamp: number;
  totalCount: number;
  query: string;
  category: string;
  sorting: string;
  page: number;
  hasNextPage: boolean;
}

interface CacheMetadata {
  lastUpdate: number;
  version: string;
  totalCachedItems: number;
}

class WallpaperCacheService {
  private readonly CACHE_PREFIX = "wallpaper_cache_";
  private readonly METADATA_KEY = "wallpaper_cache_metadata";
  private readonly CACHE_VERSION = "1.0.0";
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_ENTRIES = 50; // Maximum number of different query results to cache
  private readonly MAX_WALLPAPERS_PER_CACHE = 200; // Maximum wallpapers per query cache

  constructor() {
    this.initializeCache();
  }

  private initializeCache(): void {
    try {
      const metadata = this.getMetadata();
      if (!metadata || metadata.version !== this.CACHE_VERSION) {
        this.clearAllCache();
        this.setMetadata({
          lastUpdate: Date.now(),
          version: this.CACHE_VERSION,
          totalCachedItems: 0,
        });
      }
    } catch (error) {
      console.warn("Failed to initialize cache:", error);
      this.clearAllCache();
    }
  }

  private getMetadata(): CacheMetadata | null {
    try {
      const metadata = localStorage.getItem(this.METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.warn("Failed to get cache metadata:", error);
      return null;
    }
  }

  private setMetadata(metadata: CacheMetadata): void {
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn("Failed to set cache metadata:", error);
    }
  }

  private generateCacheKey(
    query: string,
    category: string,
    sorting: string,
    page: number
  ): string {
    const normalized = {
      query: query.toLowerCase().trim(),
      category,
      sorting,
      page,
    };
    return `${this.CACHE_PREFIX}${btoa(JSON.stringify(normalized))}`;
  }

  private isEntryValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.CACHE_DURATION;
  }

  private cleanupOldEntries(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(this.CACHE_PREFIX));

      // Sort by timestamp (oldest first)
      const entriesWithKeys = cacheKeys
        .map((key) => {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || "{}");
            return { key, timestamp: entry.timestamp || 0 };
          } catch {
            return { key, timestamp: 0 };
          }
        })
        .sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest entries if we exceed the limit
      if (entriesWithKeys.length > this.MAX_CACHE_ENTRIES) {
        const toRemove = entriesWithKeys.slice(
          0,
          entriesWithKeys.length - this.MAX_CACHE_ENTRIES
        );
        toRemove.forEach(({ key }) => {
          localStorage.removeItem(key);
        });
      }

      // Remove expired entries
      const expiredKeys = entriesWithKeys.filter(({ timestamp }) => {
        const age = Date.now() - timestamp;
        return age > this.CACHE_DURATION;
      });

      expiredKeys.forEach(({ key }) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Failed to cleanup old cache entries:", error);
    }
  }

  set(
    query: string,
    category: string,
    sorting: string,
    page: number,
    data: LocalWallpaper[],
    totalCount: number,
    hasNextPage: boolean
  ): void {
    try {
      this.cleanupOldEntries();

      const cacheKey = this.generateCacheKey(query, category, sorting, page);
      const entry: CacheEntry = {
        data: data.slice(0, this.MAX_WALLPAPERS_PER_CACHE), // Limit data size
        timestamp: Date.now(),
        totalCount,
        query,
        category,
        sorting,
        page,
        hasNextPage,
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));

      // Update metadata
      const metadata = this.getMetadata() || {
        lastUpdate: Date.now(),
        version: this.CACHE_VERSION,
        totalCachedItems: 0,
      };

      metadata.lastUpdate = Date.now();
      metadata.totalCachedItems = this.getCacheSize();
      this.setMetadata(metadata);
    } catch (error) {
      console.warn("Failed to cache wallpapers:", error);
      // If storage is full, try to clear some space
      if (error instanceof Error && error.name === "QuotaExceededError") {
        this.clearOldestEntries(5);
        // Try again
        try {
          const cacheKey = this.generateCacheKey(
            query,
            category,
            sorting,
            page
          );
          const entry: CacheEntry = {
            data: data.slice(0, this.MAX_WALLPAPERS_PER_CACHE),
            timestamp: Date.now(),
            totalCount,
            query,
            category,
            sorting,
            page,
            hasNextPage,
          };
          localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch (retryError) {
          console.warn("Failed to cache wallpapers after cleanup:", retryError);
        }
      }
    }
  }

  get(
    query: string,
    category: string,
    sorting: string,
    page: number
  ): CacheEntry | null {
    try {
      const cacheKey = this.generateCacheKey(query, category, sorting, page);
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);

      if (!this.isEntryValid(entry)) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return entry;
    } catch (error) {
      console.warn("Failed to get cached wallpapers:", error);
      return null;
    }
  }

  // Get all cached wallpapers for initial app load (most recent query)
  getRecentCache(): CacheEntry | null {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(this.CACHE_PREFIX));

      if (cacheKeys.length === 0) return null;

      let mostRecentEntry: CacheEntry | null = null;
      let mostRecentTimestamp = 0;

      for (const key of cacheKeys) {
        try {
          const entry: CacheEntry = JSON.parse(
            localStorage.getItem(key) || "{}"
          );
          if (
            this.isEntryValid(entry) &&
            entry.timestamp > mostRecentTimestamp
          ) {
            mostRecentEntry = entry;
            mostRecentTimestamp = entry.timestamp;
          }
        } catch (error) {
          // Skip invalid entries
          localStorage.removeItem(key);
        }
      }

      return mostRecentEntry;
    } catch (error) {
      console.warn("Failed to get recent cache:", error);
      return null;
    }
  }

  private getCacheSize(): number {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter((key) => key.startsWith(this.CACHE_PREFIX)).length;
    } catch (error) {
      return 0;
    }
  }

  private clearOldestEntries(count: number): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(this.CACHE_PREFIX));

      const entriesWithKeys = cacheKeys
        .map((key) => {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || "{}");
            return { key, timestamp: entry.timestamp || 0 };
          } catch {
            return { key, timestamp: 0 };
          }
        })
        .sort((a, b) => a.timestamp - b.timestamp);

      const toRemove = entriesWithKeys.slice(
        0,
        Math.min(count, entriesWithKeys.length)
      );
      toRemove.forEach(({ key }) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Failed to clear oldest entries:", error);
    }
  }

  clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(
        (key) => key.startsWith(this.CACHE_PREFIX) || key === this.METADATA_KEY
      );

      cacheKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  getCacheStats(): {
    totalEntries: number;
    totalSize: string;
    lastUpdate: Date | null;
    isHealthy: boolean;
  } {
    try {
      const metadata = this.getMetadata();
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(this.CACHE_PREFIX));

      let totalSize = 0;
      cacheKeys.forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });

      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

      return {
        totalEntries: cacheKeys.length,
        totalSize: `${sizeInMB} MB`,
        lastUpdate: metadata?.lastUpdate ? new Date(metadata.lastUpdate) : null,
        isHealthy:
          cacheKeys.length <= this.MAX_CACHE_ENTRIES &&
          totalSize < 50 * 1024 * 1024, // 50MB limit
      };
    } catch (error) {
      return {
        totalEntries: 0,
        totalSize: "0 MB",
        lastUpdate: null,
        isHealthy: false,
      };
    }
  }

  // Append more wallpapers to existing cache (for pagination)
  appendToCache(
    query: string,
    category: string,
    sorting: string,
    page: number,
    newWallpapers: LocalWallpaper[],
    totalCount: number,
    hasNextPage: boolean
  ): void {
    try {
      // Get the first page cache
      const firstPageEntry = this.get(query, category, sorting, 1);

      if (firstPageEntry && page > 1) {
        // Append new wallpapers to the existing data
        const combinedData = [...firstPageEntry.data, ...newWallpapers];

        // Update the first page cache with combined data
        this.set(
          query,
          category,
          sorting,
          1,
          combinedData,
          totalCount,
          hasNextPage
        );
      } else {
        // Just cache this page normally
        this.set(
          query,
          category,
          sorting,
          page,
          newWallpapers,
          totalCount,
          hasNextPage
        );
      }
    } catch (error) {
      console.warn("Failed to append to cache:", error);
    }
  }
}

export const wallpaperCache = new WallpaperCacheService();
