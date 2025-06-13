"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { WallpaperModal } from "@/components/ui/wallpaper-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  RefreshCw,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Trash2,
  Search,
  Grid3X3,
  List,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  showTopBarNotification,
  updateTopBarNotification,
  hideTopBarNotification,
} from "@/components/layout/top-bar";
import Image from "next/image";
import {
  OptimizedThumbnail,
  thumbnailCache,
  failedThumbnails,
} from "@/components/ui/optimized-thumbnail";
import { ExtendedLocalWallpaper } from "@/types/wallpaper";
import { LocalWallpaper } from "@/types/wallhaven";

// Memoized wallpaper card component
const WallpaperCard = memo<{
  wallpaper: ExtendedLocalWallpaper;
  onWallpaperClick: (wallpaper: ExtendedLocalWallpaper) => void;
  onSetWallpaper: (
    wallpaper: ExtendedLocalWallpaper,
    e: React.MouseEvent
  ) => void;
  onDeleteWallpaper: (
    wallpaper: ExtendedLocalWallpaper,
    e: React.MouseEvent
  ) => void;
  style?: React.CSSProperties;
  isVisible?: boolean;
}>(
  ({
    wallpaper,
    onWallpaperClick,
    onSetWallpaper,
    onDeleteWallpaper,
    style,
    isVisible = true,
  }) => {
    const handleClick = useCallback(() => {
      onWallpaperClick(wallpaper);
    }, [wallpaper, onWallpaperClick]);

    const handleSetWallpaper = useCallback(
      (e: React.MouseEvent) => {
        onSetWallpaper(wallpaper, e);
      },
      [wallpaper, onSetWallpaper]
    );

    const handleDeleteWallpaper = useCallback(
      (e: React.MouseEvent) => {
        onDeleteWallpaper(wallpaper, e);
      },
      [wallpaper, onDeleteWallpaper]
    );

    return (
      <div style={style} className="p-2">
        <Card
          className="group border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20"
          onClick={handleClick}
        >
          <div className="relative w-full aspect-[3/2] overflow-hidden rounded-2xl">
            <OptimizedThumbnail
              wallpaper={wallpaper}
              alt={`Local wallpaper ${wallpaper.filename}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              isVisible={isVisible}
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
                    Local
                  </Badge>
                  <span className="text-white/80 text-xs lg:text-sm">
                    {wallpaper.resolution}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-500/20 border-green-300/50 text-green-100 text-xs"
                >
                  Downloaded
                </Badge>
              </div>

              {/* File Info */}
              <div className="mb-3">
                <p
                  className="text-white text-xs truncate"
                  title={wallpaper.filename}
                >
                  {wallpaper.filename}
                </p>
                <p className="text-white/60 text-xs">
                  {(wallpaper.file_size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 rounded-full"
                  onClick={handleSetWallpaper}
                  title="Set as wallpaper"
                >
                  <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-red-500/20 backdrop-blur-sm border-red-300/50 text-red-100 hover:bg-red-500/30 h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 rounded-full"
                  onClick={handleDeleteWallpaper}
                  title="Delete wallpaper"
                >
                  <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);

WallpaperCard.displayName = "WallpaperCard";

export function DownloadsPage() {
  const [localWallpapers, setLocalWallpapers] = useState<
    ExtendedLocalWallpaper[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] =
    useState<ExtendedLocalWallpaper | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCacheVerifying, setIsCacheVerifying] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<{
    processed: number;
    generated: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Debug mode for development
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    setShowDebugInfo((prev) => !prev);
  }, []);

  // Debug statistics
  const debugStats = useMemo(() => {
    return {
      cacheSize: thumbnailCache.size,
      cacheMaxSize: thumbnailCache.max,
      failedThumbnails: failedThumbnails.size,
      cacheStatus,
    };
  }, [thumbnailCache.size, failedThumbnails.size, cacheStatus]);

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
      };
    };

    return debounce((query: string) => {
      // Search is handled by filteredWallpapers memo
    }, 300);
  }, []);

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = containerRef.current.offsetWidth || rect.width || 1200;
        const height = containerRef.current.offsetHeight || rect.height || 600;

        console.log(`Container size update: ${width}x${height}`);
        setContainerSize({ width, height });
      }
    };

    // Multiple attempts to get container size
    const attemptSizeUpdate = () => {
      updateSize();

      // If still 0, try again with delays
      if (containerRef.current && containerRef.current.offsetWidth === 0) {
        setTimeout(updateSize, 50);
        setTimeout(updateSize, 100);
        setTimeout(updateSize, 200);
        setTimeout(updateSize, 500);
      }
    };

    // Initial size attempt
    if (containerRef.current) {
      attemptSizeUpdate();

      const resizeObserver = new ResizeObserver(() => {
        updateSize();
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Verify thumbnail cache
  const verifyThumbnailCache = useCallback(async () => {
    if (!window.electronAPI) {
      console.error("Electron API not available");
      return;
    }

    try {
      setIsCacheVerifying(true);
      const result = await window.electronAPI.verifyWallpaperThumbnails();

      if (result.success) {
        console.log(
          `Cache verification complete: ${result.processed} processed, ${result.generated} generated`
        );
        setCacheStatus({
          processed: result.processed,
          generated: result.generated,
        });
      } else {
        console.error("Cache verification failed:", result.error);
      }
    } catch (error) {
      console.error("Error verifying thumbnail cache:", error);
    } finally {
      setIsCacheVerifying(false);
    }
  }, []);

  // Optimized wallpaper loading with caching
  const loadLocalWallpapers = useCallback(
    async (isRefresh = false) => {
      if (!window.electronAPI) {
        setError("Electron API not available");
        setIsLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        // Verify thumbnail cache first to ensure optimized loading
        if (!cacheStatus) {
          await verifyThumbnailCache();
        }

        const result = await window.electronAPI.listLocalWallpapers();

        if (result.success) {
          console.log("Loaded wallpapers:", result.wallpapers.length);
          // Ensure data structure compatibility
          const processedWallpapers = result.wallpapers.map(
            (wallpaper: any) => ({
              ...wallpaper,
              // Ensure all required ExtendedLocalWallpaper properties exist
              filename: wallpaper.filename || wallpaper.title || "unknown",
              path: wallpaper.path || wallpaper.url || wallpaper.fullRes,
              file_size: wallpaper.file_size || 0,
              // Ensure LocalWallpaper interface compatibility
              title: wallpaper.title || wallpaper.filename || "Untitled",
              description:
                wallpaper.description ||
                `Local wallpaper: ${wallpaper.filename}`,
              category: wallpaper.category || "general",
              resolution: wallpaper.resolution || "Unknown",
              size: wallpaper.size || "Unknown",
              downloads: wallpaper.downloads || 1,
              rating: wallpaper.rating || 5.0,
              tags: Array.isArray(wallpaper.tags) ? wallpaper.tags : ["local"],
              author: wallpaper.author || "Local",
              dateAdded:
                wallpaper.dateAdded ||
                wallpaper.created_at ||
                new Date().toISOString(),
              colors: Array.isArray(wallpaper.colors)
                ? wallpaper.colors
                : ["#000000"],
              thumbnail: wallpaper.thumbnail || wallpaper.path || wallpaper.url,
              preview: wallpaper.preview || wallpaper.path || wallpaper.url,
              fullRes: wallpaper.fullRes || wallpaper.path || wallpaper.url,
              source: wallpaper.source || "local",
              sourceId: wallpaper.sourceId || wallpaper.id,
            })
          );

          setLocalWallpapers(processedWallpapers as ExtendedLocalWallpaper[]);
        } else {
          setError(result.error || "Failed to load local wallpapers");
        }
      } catch (err) {
        console.error("Error loading wallpapers:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [cacheStatus, verifyThumbnailCache]
  );

  // Memoized filtered and sorted wallpapers
  const filteredWallpapers = useMemo(() => {
    let filtered = localWallpapers;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wallpaper) =>
          wallpaper.filename.toLowerCase().includes(query) ||
          wallpaper.resolution.toLowerCase().includes(query) ||
          (wallpaper.tags &&
            wallpaper.tags.some((tag: any) =>
              typeof tag === "string"
                ? tag.toLowerCase().includes(query)
                : tag.name?.toLowerCase().includes(query)
            ))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.filename.toLowerCase();
          bValue = b.filename.toLowerCase();
          break;
        case "size":
          aValue = a.file_size;
          bValue = b.file_size;
          break;
        case "date":
        default:
          aValue = new Date(a.dateAdded).getTime();
          bValue = new Date(b.dateAdded).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [localWallpapers, searchQuery, sortBy, sortOrder]);

  // Grid calculation
  const gridConfig = useMemo(() => {
    const containerWidth = containerSize.width || 1200;
    const minCardWidth = 280;
    const gap = 16;
    const padding = 24;

    const availableWidth = Math.max(minCardWidth, containerWidth - padding * 2);
    const columnsCount = Math.max(
      1,
      Math.floor((availableWidth + gap) / (minCardWidth + gap))
    );
    const cardWidth = Math.max(
      minCardWidth,
      Math.floor((availableWidth - gap * (columnsCount - 1)) / columnsCount)
    );
    const cardHeight = Math.floor(cardWidth * (2 / 3)) + 80; // 3:2 ratio + padding

    return {
      columnCount: columnsCount,
      columnWidth: cardWidth + gap,
      rowHeight: cardHeight + gap,
      rowCount: Math.ceil(filteredWallpapers.length / columnsCount),
    };
  }, [containerSize.width, filteredWallpapers.length]);

  useEffect(() => {
    loadLocalWallpapers();

    // Clear caches when component unmounts
    return () => {
      thumbnailCache.clear();
      failedThumbnails.clear();
    };
  }, [loadLocalWallpapers]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Memoized event handlers
  const handleWallpaperClick = useCallback(
    async (wallpaper: ExtendedLocalWallpaper) => {
      if (window.electronAPI) {
        try {
          const localResult = await window.electronAPI.getLocalWallpaper(
            wallpaper.filename
          );
          if (localResult.success && localResult.dataUrl) {
            setSelectedWallpaper({
              ...wallpaper,
              fullRes: localResult.dataUrl,
              thumbnail: localResult.dataUrl,
            } as ExtendedLocalWallpaper);
          } else {
            setSelectedWallpaper(wallpaper);
          }
        } catch (error) {
          console.warn("Failed to load full resolution image:", error);
          setSelectedWallpaper(wallpaper);
        }
      } else {
        setSelectedWallpaper(wallpaper);
      }
      setIsModalOpen(true);
    },
    []
  );

  const handleSetWallpaper = useCallback(
    async (wallpaper: ExtendedLocalWallpaper, e: React.MouseEvent) => {
      e.stopPropagation();

      if (!window.electronAPI) {
        showTopBarNotification({
          type: "error",
          message: "Electron API not available",
        });
        return;
      }

      const notificationId = showTopBarNotification({
        type: "loading",
        message: "Setting wallpaper...",
        subMessage: wallpaper.filename,
      });

      try {
        const result = await window.electronAPI.setWallpaper(
          wallpaper.path,
          wallpaper.filename
        );

        if (result.success) {
          updateTopBarNotification(notificationId, {
            type: "success",
            message: "Wallpaper set successfully!",
            subMessage: wallpaper.filename,
          });
        } else {
          updateTopBarNotification(notificationId, {
            type: "error",
            message: "Failed to set wallpaper",
            subMessage: result.error || "Please try again",
          });
        }
      } catch (error) {
        updateTopBarNotification(notificationId, {
          type: "error",
          message: "Error setting wallpaper",
          subMessage:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    },
    []
  );

  const handleDeleteWallpaper = useCallback(
    async (wallpaper: ExtendedLocalWallpaper, e: React.MouseEvent) => {
      e.stopPropagation();

      if (!window.electronAPI) {
        showTopBarNotification({
          type: "error",
          message: "Electron API not available",
        });
        return;
      }

      const notificationId = showTopBarNotification({
        type: "loading",
        message: "Deleting wallpaper...",
        subMessage: wallpaper.filename,
      });

      try {
        const result = await window.electronAPI.deleteLocalWallpaper(
          wallpaper.filename
        );

        if (result.success) {
          updateTopBarNotification(notificationId, {
            type: "success",
            message: "Wallpaper deleted successfully!",
            subMessage: wallpaper.filename,
          });

          // Remove from cache
          thumbnailCache.delete(wallpaper.filename);
          failedThumbnails.delete(wallpaper.filename);

          // Remove from state
          setLocalWallpapers((prev) =>
            prev.filter((w) => w.id !== wallpaper.id)
          );
        } else {
          updateTopBarNotification(notificationId, {
            type: "error",
            message: "Failed to delete wallpaper",
            subMessage: result.error || "Please try again",
          });
        }
      } catch (error) {
        updateTopBarNotification(notificationId, {
          type: "error",
          message: "Error deleting wallpaper",
          subMessage:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    },
    []
  );

  const handleRefresh = useCallback(() => {
    // Clear caches
    thumbnailCache.clear();
    failedThumbnails.clear();
    setCacheStatus(null); // Reset cache status to trigger verification
    loadLocalWallpapers(true);
  }, [loadLocalWallpapers]);

  const openWallpapersFolder = useCallback(async () => {
    if (!window.electronAPI) {
      showTopBarNotification({
        type: "error",
        message: "Electron API not available",
      });
      return;
    }

    try {
      const result = await window.electronAPI.openWallpapersFolder();
      if (result.success) {
        showTopBarNotification({
          type: "success",
          message: "Opened wallpapers folder",
          subMessage: result.path,
        });
      } else {
        showTopBarNotification({
          type: "error",
          message: "Failed to open folder",
          subMessage: result.error,
        });
      }
    } catch (error) {
      showTopBarNotification({
        type: "error",
        message: "Error opening folder",
        subMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, []);

  // Virtualized grid cell renderer
  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: any) => {
      const index = rowIndex * gridConfig.columnCount + columnIndex;
      const wallpaper = filteredWallpapers[index];

      if (!wallpaper) return null;

      return (
        <WallpaperCard
          key={wallpaper.id}
          wallpaper={wallpaper}
          onWallpaperClick={handleWallpaperClick}
          onSetWallpaper={handleSetWallpaper}
          onDeleteWallpaper={handleDeleteWallpaper}
          style={style}
          isVisible={true}
        />
      );
    },
    [
      filteredWallpapers,
      gridConfig.columnCount,
      handleWallpaperClick,
      handleSetWallpaper,
      handleDeleteWallpaper,
    ]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Downloads
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isCacheVerifying
                ? "Optimizing thumbnails for better performance..."
                : "Loading your downloaded wallpapers..."}
            </p>
            {isCacheVerifying && cacheStatus && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (cacheStatus.generated /
                          Math.max(1, cacheStatus.processed)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Generating thumbnails: {cacheStatus.generated} of{" "}
                  {cacheStatus.processed} processed
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card
              key={i}
              className="border-0 overflow-hidden bg-white/90 dark:bg-gray-900/90"
            >
              <div className="relative w-full aspect-[3/2] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Downloads
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your downloaded wallpapers
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            className="gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
            Retry
          </Button>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load wallpapers
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (localWallpapers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Downloads
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your downloaded wallpapers
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={openWallpapersFolder}
              variant="outline"
              className="gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Open Folder
            </Button>
            <Button
              onClick={handleRefresh}
              className="gap-2"
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Download className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No downloaded wallpapers
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Download wallpapers from the Wallpapers section to see them here.
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Downloads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {filteredWallpapers.length} of {localWallpapers.length} wallpaper
            {localWallpapers.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={openWallpapersFolder}
            variant="outline"
            className="gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Open Folder
          </Button>
          <Button
            onClick={handleRefresh}
            className="gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search wallpapers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "date" | "size")
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            aria-label="Sort wallpapers by"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDebugMode}
            className="text-xs"
          >
            {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
          </Button>

          {showDebugInfo && (
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono">
              <div>
                Cache Size: {debugStats.cacheSize} / {debugStats.cacheMaxSize}
              </div>
              <div>Failed Thumbnails: {debugStats.failedThumbnails}</div>
              <div>
                Cache Verification:{" "}
                {cacheStatus
                  ? `${cacheStatus.processed} processed, ${cacheStatus.generated} generated`
                  : "Not run"}
              </div>
              <div>
                Container: {containerSize.width}x{containerSize.height}
              </div>
              <div>
                Grid: {gridConfig.columnCount}x{gridConfig.rowCount}
              </div>
              <div>Total Wallpapers: {localWallpapers.length}</div>
              <div>Filtered Wallpapers: {filteredWallpapers.length}</div>
            </div>
          )}
        </div>
      )}

      {/* Virtualized Grid */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-280px)] w-full min-h-[400px]"
        style={{ minWidth: "300px" }}
      >
        {containerSize.width > 0 &&
        containerSize.height > 0 &&
        gridConfig.rowCount > 0 ? (
          <Grid
            columnCount={gridConfig.columnCount}
            columnWidth={gridConfig.columnWidth}
            height={Math.max(400, containerSize.height)}
            rowCount={gridConfig.rowCount}
            rowHeight={gridConfig.rowHeight}
            width={containerSize.width}
            overscanRowCount={2}
            overscanColumnCount={1}
          >
            {Cell}
          </Grid>
        ) : (
          // Fallback: Regular grid when virtualization fails
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8 p-4 min-h-[400px]">
            {filteredWallpapers.map((wallpaper) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                onWallpaperClick={handleWallpaperClick}
                onSetWallpaper={handleSetWallpaper}
                onDeleteWallpaper={handleDeleteWallpaper}
                isVisible={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Wallpaper Modal */}
      {selectedWallpaper && (
        <WallpaperModal
          wallpaper={selectedWallpaper as LocalWallpaper}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isDownloaded={true}
          onDownloadComplete={() => {}}
        />
      )}
    </div>
  );
}
