import { useCallback, useRef, useMemo } from 'react';

interface CacheEntry {
  data: string;
  timestamp: number;
  accessCount: number;
}

interface ThumbnailCache {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  size: number;
  cleanup: () => void;
}

export function useWallpaperCache(maxSize: number = 100, maxAge: number = 5 * 60 * 1000): ThumbnailCache {
  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const failedKeys = useRef<Set<string>>(new Set());

  const cleanup = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > maxAge) {
        cache.current.delete(key);
      }
    });

    // If still over size limit, remove least accessed items
    if (cache.current.size > maxSize) {
      const sortedEntries = entries
        .filter(([key]) => cache.current.has(key))
        .sort((a, b) => a[1].accessCount - b[1].accessCount);
      
      const itemsToRemove = cache.current.size - maxSize;
      for (let i = 0; i < itemsToRemove && i < sortedEntries.length; i++) {
        cache.current.delete(sortedEntries[i][0]);
      }
    }
  }, [maxAge, maxSize]);

  const cacheAPI = useMemo<ThumbnailCache>(() => ({
    get: (key: string) => {
      if (failedKeys.current.has(key)) return null;
      
      const entry = cache.current.get(key);
      if (!entry) return null;
      
      const now = Date.now();
      if (now - entry.timestamp > maxAge) {
        cache.current.delete(key);
        return null;
      }
      
      // Update access count and timestamp
      entry.accessCount++;
      entry.timestamp = now;
      
      return entry.data;
    },

    set: (key: string, value: string) => {
      failedKeys.current.delete(key);
      cache.current.set(key, {
        data: value,
        timestamp: Date.now(),
        accessCount: 1
      });
      
      // Cleanup if needed
      if (cache.current.size > maxSize) {
        cleanup();
      }
    },

    delete: (key: string) => {
      cache.current.delete(key);
      failedKeys.current.delete(key);
    },

    clear: () => {
      cache.current.clear();
      failedKeys.current.clear();
    },

    has: (key: string) => {
      return cache.current.has(key) && !failedKeys.current.has(key);
    },

    get size() {
      return cache.current.size;
    },

    cleanup
  }), [cleanup, maxAge, maxSize]);

  return cacheAPI;
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const metrics = useRef({
    thumbnailLoadTimes: [] as number[],
    cacheHitRate: 0,
    totalRequests: 0,
    cacheHits: 0
  });

  const recordThumbnailLoad = useCallback((loadTime: number) => {
    metrics.current.thumbnailLoadTimes.push(loadTime);
    if (metrics.current.thumbnailLoadTimes.length > 100) {
      metrics.current.thumbnailLoadTimes.shift();
    }
  }, []);

  const recordCacheHit = useCallback(() => {
    metrics.current.totalRequests++;
    metrics.current.cacheHits++;
    metrics.current.cacheHitRate = metrics.current.cacheHits / metrics.current.totalRequests;
  }, []);

  const recordCacheMiss = useCallback(() => {
    metrics.current.totalRequests++;
    metrics.current.cacheHitRate = metrics.current.cacheHits / metrics.current.totalRequests;
  }, []);

  const getAverageLoadTime = useCallback(() => {
    const times = metrics.current.thumbnailLoadTimes;
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }, []);

  const getMetrics = useCallback(() => ({
    averageLoadTime: getAverageLoadTime(),
    cacheHitRate: metrics.current.cacheHitRate,
    totalRequests: metrics.current.totalRequests,
    recentLoadTimes: [...metrics.current.thumbnailLoadTimes]
  }), [getAverageLoadTime]);

  return {
    recordThumbnailLoad,
    recordCacheHit,
    recordCacheMiss,
    getMetrics
  };
} 