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
} from "lucide-react";
import wallpaperData from "@/data/wallpapers.json";

interface Wallpaper {
  id: number;
  title: string;
  description: string;
  category: string;
  resolution: string;
  size: string;
  downloads: number;
  rating: number;
  tags: string[];
  author: string;
  dateAdded: string;
  colors: string[];
  thumbnail: string;
  preview: string;
  fullRes: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "loading";
  message: string;
  subMessage?: string;
}

export function WallpapersPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "rating">(
    "popular"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadedWallpapers, setDownloadedWallpapers] = useState<Set<number>>(
    new Set()
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { categories, wallpapers } = wallpaperData as {
    categories: string[];
    wallpapers: Wallpaper[];
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

  // Check which wallpapers are already downloaded
  useEffect(() => {
    const checkDownloadedWallpapers = async () => {
      if (!window.electronAPI) return;

      const downloaded = new Set<number>();

      for (const wallpaper of wallpapers) {
        const filename = `${wallpaper.title
          .toLowerCase()
          .replace(/\s+/g, "-")}.jpg`;
        try {
          const result = await window.electronAPI.checkWallpaperExists(
            filename
          );
          if (result.exists) {
            downloaded.add(wallpaper.id);
          }
        } catch (error) {
          console.error("Error checking wallpaper existence:", error);
        }
      }

      setDownloadedWallpapers(downloaded);
    };

    checkDownloadedWallpapers();
  }, [wallpapers]);

  // Filter and sort wallpapers
  const filteredWallpapers = useMemo(() => {
    let filtered = wallpapers;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (wallpaper) => wallpaper.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wallpaper) =>
          wallpaper.title.toLowerCase().includes(query) ||
          wallpaper.description.toLowerCase().includes(query) ||
          wallpaper.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          wallpaper.author.toLowerCase().includes(query)
      );
    }

    // Sort wallpapers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads;
        case "newest":
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [wallpapers, selectedCategory, searchQuery, sortBy]);

  const handleWallpaperClick = (wallpaper: Wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  };

  const handleDownload = (wallpaper: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();

    const filename = `${wallpaper.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.jpg`;

    if (window.electronAPI) {
      // Show loading toast
      const toastId = addToast({
        type: "loading",
        message: "Downloading wallpaper...",
        subMessage: wallpaper.title,
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

  const handleSetWallpaper = (wallpaper: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();

    const filename = `${wallpaper.title
      .toLowerCase()
      .replace(/\s+/g, "-")}.jpg`;

    if (window.electronAPI) {
      // Show loading toast
      const toastId = addToast({
        type: "loading",
        message: "Setting wallpaper...",
        subMessage: wallpaper.title,
      });

      // Use Electron API for setting wallpaper
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Wallpaper Gallery
          </h2>
          <p className="text-muted-foreground mt-1">
            Discover {wallpapers.length} stunning wallpapers for your desktop
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search wallpapers, tags, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "popular" | "newest" | "rating")
              }
              className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              title="Sort wallpapers by"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
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
            onClick={() => setSelectedCategory(category)}
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

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredWallpapers.length} of {wallpapers.length} wallpapers
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
        {filteredWallpapers.map((wallpaper) => (
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
                alt={wallpaper.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 lg:p-5 xl:p-6">
                {/* Title */}
                <h3 className="text-white font-semibold text-base lg:text-lg xl:text-xl mb-3 lg:mb-4 drop-shadow-lg line-clamp-2">
                  {wallpaper.title}
                </h3>

                {/* Meta Info */}
                <div className="flex items-center space-x-2 mb-3 lg:mb-4">
                  <span className="text-white/80 text-xs lg:text-sm px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    {wallpaper.category}
                  </span>
                  <span className="text-white/80 text-xs lg:text-sm">
                    {wallpaper.resolution}
                  </span>
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
                  >
                    <Monitor className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  {!downloadedWallpapers.has(wallpaper.id) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 rounded-full"
                      onClick={(e) => handleDownload(wallpaper, e)}
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
                      console.log("Favorited:", wallpaper.title);
                    }}
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

      {/* Empty State */}
      {filteredWallpapers.length === 0 && (
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
      />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`transform transition-all duration-300 ease-in-out ${
              toast.type === "success"
                ? "bg-green-500/95"
                : toast.type === "error"
                ? "bg-red-500/95"
                : "bg-blue-500/95"
            } backdrop-blur-md text-white rounded-2xl shadow-2xl border border-white/20 p-4 min-w-[300px] animate-in slide-in-from-right-full`}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === "success" && (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
                {toast.type === "error" && (
                  <AlertCircle className="w-5 h-5 text-white" />
                )}
                {toast.type === "loading" && (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {toast.message}
                </p>
                {toast.subMessage && (
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    {toast.subMessage}
                  </p>
                )}
              </div>

              {/* Close Button */}
              {toast.type !== "loading" && (
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-white/70 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

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
