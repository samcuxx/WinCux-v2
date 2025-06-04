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

import { CategoryFilters } from "@/components/wallpapers/category-filters";
import {
  AdvancedFilters,
  AdvancedFilters as AdvancedFiltersType,
} from "@/components/wallpapers/advanced-filters";
import { FiltersSummary } from "@/components/wallpapers/filters-summary";
import { ErrorState } from "@/components/wallpapers/error-state";
import { ResultsCount } from "@/components/wallpapers/results-count";
import { WallpaperGrid } from "@/components/wallpapers/wallpaper-grid";
import { InfiniteScrollTrigger } from "@/components/wallpapers/infinite-scroll-trigger";
import { LoadingState } from "@/components/wallpapers/loading-state";
import { EmptyState } from "@/components/wallpapers/empty-state";
import { WallpaperSkeleton } from "@/components/wallpapers/wallpaper-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Search, ChevronDown } from "lucide-react";
import { ColorFilters } from "@/components/wallpapers/color-filters";
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>({
    exactResolutions: [],
    aspectRatios: [],
  });

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
    const combinedFilters = {
      ...advancedFilters,
      colors: selectedColors,
    };

    await search(
      {
        query: searchQuery || undefined,
        category: selectedCategory,
        sorting: sortBy,
        order: "desc",
      },
      combinedFilters
    );
  };

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    const combinedFilters = {
      ...advancedFilters,
      colors: selectedColors,
    };

    await search(
      {
        query: searchQuery || undefined,
        category,
        sorting: sortBy,
        order: "desc",
      },
      combinedFilters
    );
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
    const combinedFilters = {
      ...advancedFilters,
      colors: selectedColors,
    };

    await search(
      {
        query: searchQuery || undefined,
        category: selectedCategory,
        sorting: typedSorting,
        order: "desc",
      },
      combinedFilters
    );
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

  // Advanced filters handlers
  const handleAdvancedFiltersChange = (filters: AdvancedFiltersType) => {
    setAdvancedFilters(filters);
  };

  const handleApplyAdvancedFilters = async () => {
    await handleSearch();
  };

  const handleResetAdvancedFilters = () => {
    setAdvancedFilters({
      exactResolutions: [],
      aspectRatios: [],
    });
  };

  // Auto-trigger search when advanced filters or colors change
  React.useEffect(() => {
    const hasAdvancedFilters =
      advancedFilters.exactResolutions.length > 0 ||
      advancedFilters.aspectRatios.length > 0 ||
      advancedFilters.minResolution;

    const hasColorFilters = selectedColors.length > 0;

    // Trigger search when filters are applied or removed (debounced)
    if (hasAdvancedFilters || hasColorFilters) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300); // Shorter debounce for better responsiveness

      return () => clearTimeout(timeoutId);
    } else {
      // When no filters are active, also trigger search to reset to default
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [advancedFilters, selectedColors]); // Watch both advanced filters and colors

  // Handle individual filter clearing
  const handleClearFilter = async (filterType: string, value?: string) => {
    switch (filterType) {
      case "search":
        setSearchQuery("");
        break;
      case "category":
        setSelectedCategory("All");
        break;
      case "sort":
        setSortBy("date_added");
        break;
      case "minResolution":
        setAdvancedFilters((prev) => ({ ...prev, minResolution: undefined }));
        break;
      case "exactResolutions":
        if (value) {
          setAdvancedFilters((prev) => ({
            ...prev,
            exactResolutions: prev.exactResolutions.filter((r) => r !== value),
          }));
        }
        break;
      case "aspectRatios":
        if (value) {
          setAdvancedFilters((prev) => ({
            ...prev,
            aspectRatios: prev.aspectRatios.filter((r) => r !== value),
          }));
        }
        break;

      case "colors":
        if (value) {
          setSelectedColors((prev) => prev.filter((c) => c !== value));
        }
        break;
    }

    // Automatically trigger search after clearing filter
    setTimeout(() => handleSearch(), 100);
  };

  // Handle clear all filters
  const handleClearAllFilters = async () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("date_added");
    setSelectedColors([]);
    setAdvancedFilters({
      exactResolutions: [],
      aspectRatios: [],
    });

    // Automatically trigger search after clearing all filters
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="space-y-6 relative">
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

      {/* Basic Filters (Search, Sort) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search wallpapers, tags, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) =>
              e.key === "Enter" && handleSearch()
            }
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            title="Search wallpapers"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              title="Sort wallpapers by"
              disabled={isLoading}
            >
              {sortingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
      {/* Categories, Colors and Advanced Filters */}
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            isLoading={isLoading}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <div className="shrink-0">
          <ColorFilters
            selectedColors={selectedColors}
            onColorChange={setSelectedColors}
            isLoading={isLoading}
          />
        </div>

        {/* <div className="shrink-0">
          <AdvancedFilters
            isVisible={showAdvancedFilters}
            filters={advancedFilters}
            isLoading={isLoading}
            onFiltersChange={handleAdvancedFiltersChange}
            onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
            onApply={handleApplyAdvancedFilters}
            onReset={handleResetAdvancedFilters}
          />
        </div> */}
      </div>

      {/* Active Filters Summary */}
      <FiltersSummary
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        selectedColors={selectedColors}
        advancedFilters={advancedFilters}
        onClearFilter={handleClearFilter}
        onClearAll={handleClearAllFilters}
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
