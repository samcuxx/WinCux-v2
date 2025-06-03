"use client";

import React, { useState, useMemo, useEffect } from "react";
import { WallpaperModal } from "@/components/ui/wallpaper-modal";
import { LocalWallpaper } from "@/types/wallhaven";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Monitor,
  RefreshCw,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Extended interface for local wallpapers with additional properties
interface ExtendedLocalWallpaper extends LocalWallpaper {
  filename: string;
  path: string;
  file_size: number;
}

// Optimized thumbnail component with lazy loading
function OptimizedThumbnail({
  wallpaper,
  className,
  alt,
  onClick,
}: {
  wallpaper: ExtendedLocalWallpaper;
  className?: string;
  alt: string;
  onClick?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

  // Load thumbnail on mount
  useEffect(() => {
    if (!window.electronAPI) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const loadThumbnail = async () => {
      try {
        const result = await window.electronAPI.getLocalWallpaperThumbnail(
          wallpaper.filename
        );

        if (result.success && result.thumbnailUrl) {
          setThumbnailSrc(result.thumbnailUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to load thumbnail:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadThumbnail();
  }, [wallpaper.filename]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {error || !thumbnailSrc ? (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <img
          src={thumbnailSrc}
          alt={alt}
          className={cn("w-full h-full object-cover", className)}
          onClick={onClick}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      )}
    </div>
  );
}

interface Toast {
  id: string;
  type: "success" | "error" | "loading";
  message: string;
  subMessage?: string;
}

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
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  // Load local wallpapers
  const loadLocalWallpapers = async () => {
    if (!window.electronAPI) {
      setError("Electron API not available");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await window.electronAPI.listLocalWallpapers();

      if (result.success) {
        // Cast the wallpapers to our extended type
        setLocalWallpapers(result.wallpapers as ExtendedLocalWallpaper[]);
      } else {
        setError(result.error || "Failed to load local wallpapers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Load wallpapers on component mount
  useEffect(() => {
    loadLocalWallpapers();
  }, []);

  const handleWallpaperClick = async (wallpaper: ExtendedLocalWallpaper) => {
    // Load the full resolution image for the modal
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
  };

  const handleSetWallpaper = async (
    wallpaper: ExtendedLocalWallpaper,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!window.electronAPI) {
      addToast({
        type: "error",
        message: "Electron API not available",
      });
      return;
    }

    const toastId = addToast({
      type: "loading",
      message: "Setting wallpaper...",
      subMessage: wallpaper.filename,
    });

    try {
      // For local wallpapers, we use the local file path
      const result = await window.electronAPI.setWallpaper(
        wallpaper.path,
        wallpaper.filename
      );

      if (result.success) {
        updateToast(toastId, {
          type: "success",
          message: "Wallpaper set successfully!",
          subMessage: wallpaper.filename,
        });
      } else {
        updateToast(toastId, {
          type: "error",
          message: "Failed to set wallpaper",
          subMessage: result.error || "Please try again",
        });
      }
    } catch (error) {
      updateToast(toastId, {
        type: "error",
        message: "Error setting wallpaper",
        subMessage: error instanceof Error ? error.message : "Please try again",
      });
    }

    // Auto remove toast
    setTimeout(() => removeToast(toastId), 4000);
  };

  const handleDeleteWallpaper = async (
    wallpaper: ExtendedLocalWallpaper,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!window.electronAPI) {
      addToast({
        type: "error",
        message: "Electron API not available",
      });
      return;
    }

    const toastId = addToast({
      type: "loading",
      message: "Deleting wallpaper...",
      subMessage: wallpaper.filename,
    });

    try {
      const result = await window.electronAPI.deleteLocalWallpaper(
        wallpaper.filename
      );

      if (result.success) {
        updateToast(toastId, {
          type: "success",
          message: "Wallpaper deleted successfully!",
          subMessage: wallpaper.filename,
        });

        // Remove the wallpaper from the local state
        setLocalWallpapers((prev) => prev.filter((w) => w.id !== wallpaper.id));
      } else {
        updateToast(toastId, {
          type: "error",
          message: "Failed to delete wallpaper",
          subMessage: result.error || "Please try again",
        });
      }
    } catch (error) {
      updateToast(toastId, {
        type: "error",
        message: "Error deleting wallpaper",
        subMessage: error instanceof Error ? error.message : "Please try again",
      });
    }

    // Auto remove toast
    setTimeout(() => removeToast(toastId), 4000);
  };

  const handleRefresh = () => {
    loadLocalWallpapers();
  };

  const openWallpapersFolder = async () => {
    if (!window.electronAPI) {
      addToast({
        type: "error",
        message: "Electron API not available",
      });
      return;
    }

    try {
      const result = await window.electronAPI.openWallpapersFolder();
      if (result.success) {
        addToast({
          type: "success",
          message: "Opened wallpapers folder",
          subMessage: result.path,
        });
      } else {
        addToast({
          type: "error",
          message: "Failed to open folder",
          subMessage: result.error,
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        message: "Error opening folder",
        subMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Downloads
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Loading your downloaded wallpapers...
            </p>
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

  // Render error state
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
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
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
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Render empty state
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
            <Button onClick={handleRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
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
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Downloads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {localWallpapers.length} downloaded wallpaper
            {localWallpapers.length !== 1 ? "s" : ""}
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
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Wallpaper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8">
        {localWallpapers.map((wallpaper) => (
          <Card
            key={wallpaper.id}
            className="group border-0 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20"
            onClick={() => handleWallpaperClick(wallpaper)}
          >
            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-2xl">
              <OptimizedThumbnail
                wallpaper={wallpaper}
                alt={`Local wallpaper ${wallpaper.filename}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                    onClick={(e) => handleSetWallpaper(wallpaper, e)}
                    title="Set as wallpaper"
                  >
                    <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-red-500/20 backdrop-blur-sm border-red-300/50 text-red-100 hover:bg-red-500/30 h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 rounded-full"
                    onClick={(e) => handleDeleteWallpaper(wallpaper, e)}
                    title="Delete wallpaper"
                  >
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Wallpaper Modal */}
      {selectedWallpaper && (
        <WallpaperModal
          wallpaper={selectedWallpaper as LocalWallpaper}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isDownloaded={true}
          onDownloadComplete={() => {}} // No-op since these are already downloaded
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-lg shadow-lg backdrop-blur-sm border max-w-sm",
              toast.type === "success" &&
                "bg-green-50/90 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
              toast.type === "error" &&
                "bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
              toast.type === "loading" &&
                "bg-blue-50/90 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
            )}
          >
            <p className="font-medium">{toast.message}</p>
            {toast.subMessage && (
              <p className="text-sm opacity-75 mt-1">{toast.subMessage}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
