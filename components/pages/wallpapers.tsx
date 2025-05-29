"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { WallpaperModal } from "@/components/ui/wallpaper-modal";
import {
  Search,
  Heart,
  Download,
  Grid3X3,
  List,
  ChevronDown,
  Monitor,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Clock,
  HardDrive,
  Settings,
  Shield,
} from "lucide-react";
import { useWallpapers } from "@/hooks/use-wallpapers";
import { wallpaperProvider } from "@/lib/providers/wallpaper-provider";
import { LocalWallpaper } from "@/types/wallhaven";
import { WallpaperSourceStatus } from "@/components/ui/wallpaper-source-status";
import { useSettings } from "@/lib/contexts/settings-context";

interface Toast {
  id: string;
  type: "success" | "error" | "loading";
  message: string;
  subMessage?: string;
}

export function WallpapersPage() {
  const {
    allowNSFW,
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
  const [toasts, setToasts] = useState<Toast[]>([]);
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
    [getSettingsCacheStats, wallpapers.length]
  );

  // Format cache age for display
  const formatCacheAge = (ageMs?: number): string => {
    if (!ageMs) return "";
    const minutes = Math.floor(ageMs / (1000 * 60));
    const seconds = Math.floor((ageMs % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  // Toast management functions
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove toast after 4 seconds (except loading toasts)
    if (toast.type !== "loading") {
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const updateToast = (id: string, updates: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast))
    );
  };

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
      // Show loading toast
      const toastId = addToast({
        type: "loading",
        message: "Downloading wallpaper...",
        subMessage: `ID: ${wallpaper.id}`,
      });

      // Use Electron API for download
      window.electronAPI
        .downloadWallpaper(wallpaper.fullRes, filename)
        .then((result) => {
          if (result.success) {
            // Update toast to success
            updateToast(toastId, {
              type: "success",
              message: "Wallpaper downloaded successfully!",
              subMessage: "Saved to Pictures/Wallpapers folder",
            });

            // Auto remove success toast
            setTimeout(() => removeToast(toastId), 4000);

            // Mark wallpaper as downloaded immediately
            setDownloadedWallpapers((prev) => {
              const newSet = new Set(prev);
              newSet.add(wallpaper.id);
              return newSet;
            });
          } else {
            // Update toast to error
            updateToast(toastId, {
              type: "error",
              message: "Download failed",
              subMessage: result.error || "Please try again",
            });

            // Auto remove error toast
            setTimeout(() => removeToast(toastId), 4000);
          }
        })
        .catch((error) => {
          // Update toast to error
          updateToast(toastId, {
            type: "error",
            message: "Download failed",
            subMessage: "Network error occurred",
          });

          // Auto remove error toast
          setTimeout(() => removeToast(toastId), 4000);
          console.error("Download error:", error);
        });
    } else {
      // Fallback for browser environment
      addToast({
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
      // Show loading toast
      const toastId = addToast({
        type: "loading",
        message: "Setting wallpaper...",
        subMessage: `ID: ${wallpaper.id}`,
      });

      // Use Electron API for setting wallpaper (this will download if needed)
      window.electronAPI
        .setWallpaper(wallpaper.fullRes, filename)
        .then((result) => {
          if (result.success) {
            // Update toast to success
            updateToast(toastId, {
              type: "success",
              message: "Wallpaper set successfully!",
              subMessage: "Your desktop background has been updated",
            });

            // Auto remove success toast
            setTimeout(() => removeToast(toastId), 4000);

            // Mark wallpaper as downloaded since it was saved to disk
            setDownloadedWallpapers((prev) => {
              const newSet = new Set(prev);
              newSet.add(wallpaper.id);
              return newSet;
            });
          } else {
            // Update toast to error
            updateToast(toastId, {
              type: "error",
              message: "Failed to set wallpaper",
              subMessage: result.error || "Please try again",
            });

            // Auto remove error toast
            setTimeout(() => removeToast(toastId), 4000);
          }
        })
        .catch((error) => {
          // Update toast to error
          updateToast(toastId, {
            type: "error",
            message: "Failed to set wallpaper",
            subMessage: "An error occurred",
          });

          // Auto remove error toast
          setTimeout(() => removeToast(toastId), 4000);
          console.error("Set wallpaper error:", error);
        });
    } else {
      // Fallback to download in browser environment
      handleDownload(wallpaper, e);
    }
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
    addToast({
      type: "success",
      message: "Cache cleared successfully",
      subMessage: "Fresh data will be loaded on next search",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Wallpaper Gallery
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-muted-foreground flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading wallpapers...
                </>
              ) : error ? (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  Connection error - showing cached results
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  {totalCount > 0
                    ? `${totalCount.toLocaleString()} wallpapers from Wallhaven`
                    : "No wallpapers found"}
                </>
              )}
            </p>

            {/* Cache Status Indicator */}
            {isFromCache && (
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Cached {formatCacheAge(cacheAge)}
                </span>
              </div>
            )}

            {/* NSFW Filter Status Indicator */}
            <div className="flex items-center gap-2">
              <Shield
                className={`w-4 h-4 ${
                  allowNSFW ? "text-red-500" : "text-green-500"
                }`}
              />
              <span
                className={`text-sm ${
                  allowNSFW
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {allowNSFW ? "All Content" : "SFW Only"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Cache Management */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCacheStats(!showCacheStats)}
            title="Cache statistics"
          >
            <HardDrive className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            title="Refresh wallpapers"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cache Statistics Panel */}
      {showCacheStats && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Cache Statistics
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Clear Cache
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">Entries:</span>
              <span className="font-medium">{cacheStats.totalEntries}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">{cacheStats.totalSize}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-muted-foreground">Last Update:</span>
              <span className="font-medium">
                {cacheStats.lastUpdate
                  ? new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(cacheStats.lastUpdate)
                  : "Never"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  cacheStats.isHealthy ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-muted-foreground">Status:</span>
              <span
                className={`font-medium ${
                  cacheStats.isHealthy ? "text-green-600" : "text-red-600"
                }`}
              >
                {cacheStats.isHealthy ? "Healthy" : "Needs Cleanup"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search wallpapers, tags, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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

      {/* Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
            disabled={isLoading}
            className={
              selectedCategory === category
                ? "bg-gradient-to-r from-blue-600 to-purple-600 shrink-0"
                : "shrink-0"
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Connection Error
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300">
                {error.message}. Showing cached results if available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {wallpapers.length} wallpapers
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
      </div>

      {/* Wallpaper Grid */}
      <div
        className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8"
            : "grid grid-cols-1 gap-4"
        } w-full`}
      >
        {wallpapers.map((wallpaper) => (
          <Card
            key={wallpaper.id}
            className="group border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20"
            onClick={() => handleWallpaperClick(wallpaper)}
          >
            <div
              className={`relative w-full ${
                viewMode === "list" ? "h-48" : "aspect-[3/2]"
              } overflow-hidden rounded-2xl`}
            >
              <img
                src={wallpaper.thumbnail}
                alt={`Wallpaper ${wallpaper.id}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 lg:p-5 xl:p-6">
                {/* Meta Info */}
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white text-xs"
                    >
                      {wallpaper.category}
                    </Badge>
                    <span className="text-white/80 text-xs lg:text-sm">
                      {wallpaper.resolution}
                    </span>
                  </div>
                  {wallpaper.source === "wallhaven" && (
                    <Badge
                      variant="outline"
                      className="bg-purple-500/20 border-purple-300/50 text-purple-100 text-xs"
                    >
                      Wallhaven
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-2 lg:space-x-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetWallpaper(wallpaper, e);
                    }}
                    title="Set as wallpaper"
                  >
                    <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  {!downloadedWallpapers.has(wallpaper.id) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 rounded-full"
                      onClick={(e) => handleDownload(wallpaper, e)}
                      title="Download wallpaper"
                    >
                      <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle favorite functionality
                      console.log("Favorited:", wallpaper.id);
                    }}
                    title="Add to favorites"
                  >
                    <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>
              </div>

              {/* Status Badge for Downloaded Wallpapers */}
              {downloadedWallpapers.has(wallpaper.id) && (
                <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                  Downloaded
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Button - Prominent at bottom */}
      {hasNextPage && (
        <div className="flex justify-center py-8">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading more wallpapers...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Load More Wallpapers
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && wallpapers.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Loading wallpapers...</h3>
          <p className="text-muted-foreground">
            Fetching high-quality wallpapers from Wallhaven
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && wallpapers.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No wallpapers found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              handleSearch();
            }}
          >
            Clear Filters
          </Button>
        </div>
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
      <WallpaperSourceStatus />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start space-x-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border max-w-sm transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400 text-white"
                : toast.type === "error"
                ? "bg-red-500/90 border-red-400 text-white"
                : "bg-blue-500/90 border-blue-400 text-white"
            }`}
          >
            {toast.type === "loading" && (
              <Loader2 className="w-5 h-5 animate-spin mt-0.5 shrink-0" />
            )}
            {toast.type === "success" && (
              <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{toast.message}</p>
              {toast.subMessage && (
                <p className="text-xs opacity-90 mt-1">{toast.subMessage}</p>
              )}
            </div>

            {toast.type !== "loading" && (
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                title="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Progress bar for loading toasts */}
            {toast.type === "loading" && (
              <div className="mt-3 w-full bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
