import { useState, useEffect, useCallback, useRef } from "react";
import { RainmeterSkin, SkinSearchParams } from "@/types/rainmeter";
import { rainmeterSkinsAPI } from "@/lib/services/rainmeter-skins-api";

interface UseRainmeterSkinsOptions extends SkinSearchParams {
  autoLoad?: boolean;
  enabled?: boolean;
}

interface UseRainmeterSkinsResult {
  skins: RainmeterSkin[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  totalCount: number;
  hasNextPage: boolean;
  isFromCache: boolean;
  cacheAge?: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (options: SkinSearchParams) => Promise<void>;
  clearCache: () => void;
  getCacheStats: () => any;
}

export function useRainmeterSkins(
  options: UseRainmeterSkinsOptions = {}
): UseRainmeterSkinsResult {
  const [skins, setSkins] = useState<RainmeterSkin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheAge, setCacheAge] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentOptions, setCurrentOptions] =
    useState<SkinSearchParams>(options);

  const isInitialized = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { enabled = true, autoLoad = true, ...searchOptions } = options;

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (isInitialized.current || !enabled) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check cache stats first
        const cacheStats = rainmeterSkinsAPI.getCacheStats();
        if (cacheStats.isCached && cacheStats.cacheAge < 5 * 60 * 1000) {
          setIsFromCache(true);
          setCacheAge(cacheStats.cacheAge);
        }

        // If autoLoad is disabled, perform initial search anyway
        const searchOptions: SkinSearchParams =
          autoLoad !== false ? options : { sorting: "rating" };
        await performSearch(searchOptions, false);
      } catch (err) {
        console.error("Failed to load initial skins data:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load skins")
        );
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    loadInitialData();
  }, [enabled]); // Only run when enabled changes

  const performSearch = useCallback(
    async (
      searchOptions: SkinSearchParams,
      showLoading = true
    ): Promise<void> => {
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

        const result = await rainmeterSkinsAPI.searchSkins({
          ...searchOptions,
          page: 1,
        });

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setSkins(result.skins);
        setTotalCount(result.totalCount);
        setHasNextPage(result.hasNextPage);
        setCurrentPage(1);
        setCurrentOptions(searchOptions);
        setError(null);

        // Update cache info
        const cacheStats = rainmeterSkinsAPI.getCacheStats();
        setIsFromCache(cacheStats.isCached);
        setCacheAge(cacheStats.cacheAge);

        console.log("Skins search completed:", {
          query: searchOptions.query,
          category: searchOptions.category,
          sorting: searchOptions.sorting,
          count: result.skins.length,
          fromCache: cacheStats.isCached,
          cacheAge: cacheStats.cacheAge
            ? Math.round(cacheStats.cacheAge / 1000)
            : 0,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Request was cancelled, don't show error
        }

        console.error("Skins search failed:", err);
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
    []
  );

  const search = useCallback(
    async (searchOptions: SkinSearchParams): Promise<void> => {
      await performSearch(searchOptions, true);
    },
    [performSearch]
  );

  const refresh = useCallback(async (): Promise<void> => {
    // Clear cache before refreshing
    rainmeterSkinsAPI.clearCache();
    setIsFromCache(false);
    setCacheAge(undefined);

    await performSearch(currentOptions, true);
  }, [currentOptions, performSearch]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasNextPage || isLoading) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const result = await rainmeterSkinsAPI.searchSkins({
        ...currentOptions,
        page: currentPage + 1,
      });

      // Append new skins to existing ones
      setSkins((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newSkins = result.skins.filter((s) => !existingIds.has(s.id));
        return [...prev, ...newSkins];
      });

      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setCurrentPage((prev) => prev + 1);

      console.log("Load more skins completed:", {
        newCount: result.skins.length,
        totalCount: skins.length + result.skins.length,
        hasMore: result.hasNextPage,
      });
    } catch (err) {
      console.error("Load more skins failed:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load more skins")
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
    skins.length,
  ]);

  const clearCache = useCallback((): void => {
    rainmeterSkinsAPI.clearCache();
    setIsFromCache(false);
    setCacheAge(undefined);
  }, []);

  const getCacheStats = useCallback(() => {
    return rainmeterSkinsAPI.getCacheStats();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    skins,
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
