"use client";

import React, { useState, useMemo, useEffect } from "react";
import { WallpaperModal } from "@/components/ui/wallpaper-modal";
import { useWallpapers } from "@/hooks/use-wallpapers";
import { wallpaperProvider } from "@/lib/providers/wallpaper-provider";
import { LocalWallpaper } from "@/types/wallhaven";
import { WallpaperSourceStatus } from "@/components/ui/wallpaper-source-status";
import { useSettings } from "@/lib/contexts/settings-context";
import { WallpaperHeader } from "@/components/wallpapers/wallpaper-header";
import { CacheStatsPanel } from "@/components/wallpapers/cache-stats-panel";
import { SearchFilters } from "@/components/wallpapers/search-filters";
import { CategoryFilters } from "@/components/wallpapers/category-filters";
import { ErrorState } from "@/components/wallpapers/error-state";
import { ResultsCount } from "@/components/wallpapers/results-count";
import { WallpaperGrid } from "@/components/wallpapers/wallpaper-grid";
import { InfiniteScrollTrigger } from "@/components/wallpapers/infinite-scroll-trigger";
import { LoadingState } from "@/components/wallpapers/loading-state";
import { EmptyState } from "@/components/wallpapers/empty-state";
import { WallpaperSkeleton } from "@/components/wallpapers/wallpaper-skeleton";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import {
  showTopBarNotification,
  updateTopBarNotification,
  hideTopBarNotification,
} from "@/components/layout/top-bar";

export function WallpapersPage() {
  const {
    clearCache: clearSettingsCache,
    getCacheStats: getSettingsCacheStats,
  } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<
    "date_added" | "toplist" | "views" | "favorites" | "random" | "relevance"
  >("date_added");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedWallpaper, setSelectedWallpaper] =
    useState<LocalWallpaper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadedWallpapers, setDownloadedWallpapers] = useState<Set<string>>(
    new Set()
  );
  const [showCacheStats, setShowCacheStats] = useState(false);

  // Use the wallpaper hook with search options
  const {
    wallpapers,
    isLoading,
    error,
    totalCount,
    hasNextPage,
    refresh,
    loadMore,
    search,
    isLoadingMore,
    isFromCache,
    cacheAge,
  } = useWallpapers({
    query: searchQuery || undefined,
    category: selectedCategory,
    sorting: sortBy,
    order: "desc",
    autoLoad: true,
  });

  // Get available categories from provider
  const categories = wallpaperProvider.getAvailableCategories();
  const sortingOptions = wallpaperProvider.getSortingOptions();

  // Cache stats from unified system
  const cacheStats = useMemo(
    () => getSettingsCacheStats(),
    [getSettingsCacheStats]
  );

  // Notification management using top bar

  // Handle search
  const handleSearch = async () => {
    await search({
      query: searchQuery || undefined,
      category: selectedCategory,
      sorting: sortBy,
      order: "desc",
    });
  };

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    await search({
      query: searchQuery || undefined,
      category,
      sorting: sortBy,
      order: "desc",
    });
  };

  // Handle sorting change
  const handleSortChange = async (sorting: string) => {
    const typedSorting = sorting as
      | "date_added"
      | "toplist"
      | "views"
      | "favorites"
      | "random"
      | "relevance";
    setSortBy(typedSorting);
    await search({
      query: searchQuery || undefined,
      category: selectedCategory,
      sorting: typedSorting,
      order: "desc",
    });
  };

  const handleWallpaperClick = (wallpaper: LocalWallpaper) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  };

  const handleDownload = (wallpaper: LocalWallpaper, e: React.MouseEvent) => {
    e.stopPropagation();

    // Use wallpaper ID for consistent filename
    const filename = `wallpaper_${wallpaper.id}.jpg`;

    if (window.electronAPI) {
      // Show loading notification in top bar
      const notificationId = showTopBarNotification({
        type: "loading",
        message: "Downloading wallpaper...",
        subMessage: `ID: ${wallpaper.id}`,
      });

      // Use Electron API for download
      window.electronAPI
        .downloadWallpaper(wallpaper.fullRes, filename)
        .then((result) => {
          if (result.success) {
            // Update notification to success
            updateTopBarNotification(notificationId, {
              type: "success",
              message: "Wallpaper downloaded successfully!",
              subMessage: "Saved to Pictures/Wallpapers folder",
            });

            // Mark wallpaper as downloaded immediately
            setDownloadedWallpapers((prev) => {
              const newSet = new Set(prev);
              newSet.add(wallpaper.id);
              return newSet;
            });
          } else {
            // Update notification to error
            updateTopBarNotification(notificationId, {
              type: "error",
              message: "Download failed",
              subMessage: result.error || "Please try again",
            });
          }
        })
        .catch((error) => {
          // Update notification to error
          updateTopBarNotification(notificationId, {
            type: "error",
            message: "Download failed",
            subMessage: "Network error occurred",
          });
          console.error("Download error:", error);
        });
    } else {
      // Fallback for browser environment
      showTopBarNotification({
        type: "success",
        message: "Download started!",
        subMessage: "Check your downloads folder",
      });

      const link = document.createElement("a");
      link.href = wallpaper.fullRes;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Mark as downloaded in browser environment too
      setDownloadedWallpapers((prev) => {
        const newSet = new Set(prev);
        newSet.add(wallpaper.id);
        return newSet;
      });
    }
  };

  const handleSetWallpaper = (
    wallpaper: LocalWallpaper,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    // Use wallpaper ID for consistent filename
    const filename = `wallpaper_${wallpaper.id}.jpg`;

    if (window.electronAPI) {
      // Show loading notification in top bar
      const notificationId = showTopBarNotification({
        type: "loading",
        message: "Setting wallpaper...",
        subMessage: `ID: ${wallpaper.id}`,
      });

      // Use Electron API for setting wallpaper (this will download if needed)
      window.electronAPI
        .setWallpaper(wallpaper.fullRes, filename)
        .then((result) => {
          if (result.success) {
            // Update notification to success
            updateTopBarNotification(notificationId, {
              type: "success",
              message: "Wallpaper set successfully!",
              subMessage: "Your desktop background has been updated",
            });

            // Mark wallpaper as downloaded since it was saved to disk
            setDownloadedWallpapers((prev) => {
              const newSet = new Set(prev);
              newSet.add(wallpaper.id);
              return newSet;
            });
          } else {
            // Update notification to error
            updateTopBarNotification(notificationId, {
              type: "error",
              message: "Failed to set wallpaper",
              subMessage: result.error || "Please try again",
            });
          }
        })
        .catch((error) => {
          // Update notification to error
          updateTopBarNotification(notificationId, {
            type: "error",
            message: "Failed to set wallpaper",
            subMessage: "An error occurred",
          });
          console.error("Set wallpaper error:", error);
        });
    } else {
      // Fallback to download in browser environment
      handleDownload(wallpaper, e);
    }
  };

  const handleFavorite = (wallpaper: LocalWallpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle favorite functionality
    console.log("Favorited:", wallpaper.id);
  };

  // Check for existing downloaded wallpapers on mount
  useEffect(() => {
    const checkExistingWallpapers = async () => {
      if (!window.electronAPI || wallpapers.length === 0) return;

      const existingWallpapers = new Set<string>();

      for (const wallpaper of wallpapers) {
        const filename = `wallpaper_${wallpaper.id}.jpg`;
        try {
          const result = await window.electronAPI.checkWallpaperExists(
            filename
          );
          if (result.exists) {
            existingWallpapers.add(wallpaper.id);
          }
        } catch (error) {
          // Silently ignore errors for individual file checks
        }
      }

      if (existingWallpapers.size > 0) {
        setDownloadedWallpapers(existingWallpapers);
      }
    };

    checkExistingWallpapers();
  }, [wallpapers]);

  const handleClearCache = () => {
    clearSettingsCache();
    showTopBarNotification({
      type: "success",
      message: "Cache cleared successfully",
      subMessage: "Fresh data will be loaded on next search",
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    handleSearch();
  };

  return (
    <div className="space-y-6">
      {/* Infinite scroll loading indicator at top */}
      {isLoadingMore && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-500 to-purple-500 h-1">
          <div className="h-full bg-white/30 animate-pulse"></div>
        </div>
      )}

      {/* Header */}
      <WallpaperHeader
        isLoading={isLoading}
        error={error}
        totalCount={totalCount}
        isFromCache={isFromCache}
        cacheAge={cacheAge}
        viewMode={viewMode}
        showCacheStats={showCacheStats}
        onRefresh={refresh}
        onToggleCacheStats={() => setShowCacheStats(!showCacheStats)}
        onViewModeChange={setViewMode}
      />

      {/* Cache Statistics Panel */}
      <CacheStatsPanel
        isVisible={showCacheStats}
        cacheStats={cacheStats}
        onClearCache={handleClearCache}
      />

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        sortBy={sortBy}
        isLoading={isLoading}
        sortingOptions={sortingOptions}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
      />

      {/* Categories */}
      <CategoryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        isLoading={isLoading}
        onCategoryChange={handleCategoryChange}
      />

      {/* Error State */}
      {error && <ErrorState error={error} />}

      {/* Results Count */}
      <ResultsCount
        count={wallpapers.length}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />

      {/* Wallpaper Grid or Skeleton Loading */}
      {isLoading && wallpapers.length === 0 ? (
        <WallpaperSkeleton count={24} viewMode={viewMode} />
      ) : (
        <WallpaperGrid
          wallpapers={wallpapers}
          viewMode={viewMode}
          downloadedWallpapers={downloadedWallpapers}
          onWallpaperClick={handleWallpaperClick}
          onSetWallpaper={handleSetWallpaper}
          onDownload={handleDownload}
          onFavorite={handleFavorite}
        />
      )}

      {/* Skeleton cards for loading more */}
      {isLoadingMore && wallpapers.length > 0 && (
        <WallpaperSkeleton count={8} viewMode={viewMode} />
      )}

      {/* Infinite Scroll Trigger */}
      <InfiniteScrollTrigger
        hasNextPage={hasNextPage}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        threshold={600}
        rootMargin="300px"
      />

      {/* Manual Load More Button (fallback) - only show if there's an error */}
      {error && hasNextPage && (
        <div className="flex justify-center py-6">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:border-orange-800 dark:text-orange-300"
          >
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Retry Loading More
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && wallpapers.length === 0 && !error && (
        <EmptyState onClearFilters={handleClearFilters} />
      )}

      {/* Preview Modal */}
      <WallpaperModal
        wallpaper={selectedWallpaper}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDownloaded={
          selectedWallpaper
            ? downloadedWallpapers.has(selectedWallpaper.id)
            : false
        }
        onDownloadComplete={(wallpaperId: string) => {
          setDownloadedWallpapers((prev) => {
            const newSet = new Set(prev);
            newSet.add(wallpaperId);
            return newSet;
          });
        }}
      />

      {/* Source Status Component */}
      {/* <WallpaperSourceStatus /> */}
    </div>
  );
}
