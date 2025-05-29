import { useState, useEffect, useCallback, useRef } from "react";
import {
  wallpaperProvider,
  SearchOptions,
  SearchResult,
} from "@/lib/providers/wallpaper-provider";
import { LocalWallpaper } from "@/types/wallhaven";
import { useSettings } from "@/lib/contexts/settings-context";

interface UseWallpapersOptions extends SearchOptions {
  autoLoad?: boolean;
  enabled?: boolean;
  cacheTime?: number;
  staleTime?: number;
}

interface UseWallpapersResult {
  wallpapers: LocalWallpaper[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  totalCount: number;
  hasNextPage: boolean;
  isFromCache: boolean;
  cacheAge?: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (options: SearchOptions) => Promise<void>;
  clearCache: () => void;
  getCacheStats: () => any;
}

export function useWallpapers(
  options: UseWallpapersOptions = {}
): UseWallpapersResult {
  const { getPuritySetting } = useSettings();
  const [wallpapers, setWallpapers] = useState<LocalWallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheAge, setCacheAge] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentOptions, setCurrentOptions] = useState<SearchOptions>(options);

  const isInitialized = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { enabled = true, autoLoad = true, ...searchOptions } = options;

  // Load initial cached data immediately on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (isInitialized.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Try to get cached data first
        const cachedData = await wallpaperProvider.getInitialData();

        if (cachedData) {
          console.log("Loaded initial cached data:", {
            count: cachedData.wallpapers.length,
            cacheAge: cachedData.cacheAge
              ? Math.round(cachedData.cacheAge / 1000)
              : 0,
          });

          setWallpapers(cachedData.wallpapers);
          setTotalCount(cachedData.totalCount);
          setHasNextPage(cachedData.hasNextPage);
          setIsFromCache(cachedData.isFromCache);
          setCacheAge(cachedData.cacheAge);
          setError(null);

          // If cache is recent (< 5 minutes), don't fetch new data
          if (cachedData.cacheAge && cachedData.cacheAge < 5 * 60 * 1000) {
            setIsLoading(false);
            isInitialized.current = true;
            return;
          }
        }

        // If no cache or cache is old, perform initial search
        const searchOptions: SearchOptions =
          autoLoad !== false ? options : { sorting: "date_added" };
        await performSearch(searchOptions, false);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load wallpapers")
        );
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    loadInitialData();
  }, []); // Only run once on mount

  const performSearch = useCallback(
    async (
      searchOptions: SearchOptions,
      showLoading = true
    ): Promise<SearchResult | null> => {
      try {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);

        const result = await wallpaperProvider.search({
          ...searchOptions,
          purity: getPuritySetting(),
          page: 1,
        });

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        setWallpapers(result.wallpapers);
        setTotalCount(result.totalCount);
        setHasNextPage(result.hasNextPage);
        setIsFromCache(result.isFromCache);
        setCacheAge(result.cacheAge);
        setCurrentPage(1);
        setCurrentOptions(searchOptions);
        setError(null);

        console.log("Search completed:", {
          query: searchOptions.query,
          category: searchOptions.category,
          sorting: searchOptions.sorting,
          count: result.wallpapers.length,
          fromCache: result.isFromCache,
          cacheAge: result.cacheAge ? Math.round(result.cacheAge / 1000) : 0,
        });

        return result;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null; // Request was cancelled, don't show error
        }

        console.error("Search failed:", err);
        const error = err instanceof Error ? err : new Error("Search failed");
        setError(error);
        throw error;
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [getPuritySetting]
  );

  const search = useCallback(
    async (searchOptions: SearchOptions): Promise<void> => {
      await performSearch(searchOptions, true);
    },
    [performSearch]
  );

  const refresh = useCallback(async (): Promise<void> => {
    await performSearch(currentOptions, true);
  }, [currentOptions, performSearch]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasNextPage || isLoading) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const result = await wallpaperProvider.loadMore({
        ...currentOptions,
        purity: getPuritySetting(),
        page: currentPage,
      });

      // Append new wallpapers to existing ones
      setWallpapers((prev) => {
        const existingIds = new Set(prev.map((w) => w.id));
        const newWallpapers = result.wallpapers.filter(
          (w) => !existingIds.has(w.id)
        );
        return [...prev, ...newWallpapers];
      });

      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setCurrentPage((prev) => prev + 1);

      console.log("Load more completed:", {
        newCount: result.wallpapers.length,
        totalCount: wallpapers.length + result.wallpapers.length,
        hasMore: result.hasNextPage,
        fromCache: result.isFromCache,
      });
    } catch (err) {
      console.error("Load more failed:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load more wallpapers")
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    currentOptions,
    currentPage,
    hasNextPage,
    isLoadingMore,
    isLoading,
    wallpapers.length,
  ]);

  const clearCache = useCallback((): void => {
    wallpaperProvider.clearCache();
    setIsFromCache(false);
    setCacheAge(undefined);
  }, []);

  const getCacheStats = useCallback(() => {
    return wallpaperProvider.getCacheStats();
  }, []);

  // Listen for NSFW setting changes and clear cache
  useEffect(() => {
    const handleNSFWSettingChange = (event: CustomEvent) => {
      console.log("NSFW setting change detected:", event.detail);

      // Clear cache immediately
      wallpaperProvider.clearCache();
      setIsFromCache(false);
      setCacheAge(undefined);

      // Refresh current search with new settings immediately
      if (currentOptions && !isLoading) {
        console.log("Refreshing wallpapers with new NSFW setting");
        performSearch(
          {
            ...currentOptions,
            purity: event.detail.puritySetting,
          },
          true
        ).catch((error) => {
          console.error(
            "Failed to refresh wallpapers after NSFW setting change:",
            error
          );
        });
      }
    };

    // Type assertion for the custom event
    const typedHandler = handleNSFWSettingChange as EventListener;

    window.addEventListener("nsfw-setting-changed", typedHandler);

    return () => {
      window.removeEventListener("nsfw-setting-changed", typedHandler);
    };
  }, [currentOptions, performSearch, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    wallpapers,
    isLoading,
    isLoadingMore,
    error,
    totalCount,
    hasNextPage,
    isFromCache,
    cacheAge,
    refresh,
    loadMore,
    search,
    clearCache,
    getCacheStats,
  };
}

// Hook for getting trending wallpapers
export function useTrendingWallpapers(
  options: UseWallpapersOptions = {}
): UseWallpapersResult {
  return useWallpapers({
    ...options,
    sorting: "toplist",
    order: "desc",
  });
}

// Hook for getting latest wallpapers
export function useLatestWallpapers(
  options: UseWallpapersOptions = {}
): UseWallpapersResult {
  return useWallpapers({
    ...options,
    sorting: "date_added",
    order: "desc",
  });
}

// Hook for getting random wallpapers
export function useRandomWallpapers(
  options: UseWallpapersOptions = {}
): UseWallpapersResult {
  return useWallpapers({
    ...options,
    sorting: "random",
  });
}

// Hook for getting a specific wallpaper
export function useWallpaper(id: string, source: string = "wallhaven") {
  const [wallpaper, setWallpaper] = useState<LocalWallpaper | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchWallpaper = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await wallpaperProvider.getWallpaperById(id, source);
        setWallpaper(result);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch wallpaper");
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallpaper();
  }, [id, source]);

  return { wallpaper, isLoading, error };
}
