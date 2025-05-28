"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Heart, Monitor, Star, Loader2 } from "lucide-react";

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

interface WallpaperModalProps {
  wallpaper: Wallpaper | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WallpaperModal({
  wallpaper,
  isOpen,
  onClose,
}: WallpaperModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSettingWallpaper, setIsSettingWallpaper] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!isOpen || !wallpaper) return null;

  const getFilename = (title: string) => {
    return `${title.toLowerCase().replace(/\s+/g, "-")}.jpg`;
  };

  const handleDownload = async () => {
    if (!window.electronAPI) {
      // Fallback for browser environment
      const link = document.createElement("a");
      link.href = wallpaper.fullRes;
      link.download = getFilename(wallpaper.title);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setIsDownloading(true);
    try {
      const result = await window.electronAPI.downloadWallpaper(
        wallpaper.fullRes,
        getFilename(wallpaper.title)
      );

      if (result.success) {
        // Show success notification
        console.log("Download completed:", result.path);
        console.log("Wallpaper saved to Pictures/Wallpapers folder");
        // You could add a toast notification here
      } else {
        console.error("Download failed:", result.error);
        // You could add an error notification here
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSetWallpaper = async () => {
    if (!window.electronAPI) {
      // Fallback to download in browser environment
      handleDownload();
      return;
    }

    setIsSettingWallpaper(true);
    try {
      const result = await window.electronAPI.setWallpaper(
        wallpaper.fullRes,
        getFilename(wallpaper.title)
      );

      if (result.success) {
        console.log("Wallpaper set successfully:", result.path);
        console.log(
          "Wallpaper saved to Pictures/Wallpapers folder and set as desktop background"
        );
        // You could add a success notification here
        onClose(); // Close modal on success
      } else {
        console.error("Failed to set wallpaper:", result.error);
        // You could add an error notification here
      }
    } catch (error) {
      console.error("Set wallpaper error:", error);
    } finally {
      setIsSettingWallpaper(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    console.log("Favorited:", wallpaper.title);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Image */}
        <div className="relative">
          <img
            src={wallpaper.preview}
            alt={wallpaper.title}
            className="w-full h-[70vh] object-cover"
          />

          {/* Bottom Overlay with Info and Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
            <div className="flex items-end justify-between">
              {/* Title and Basic Info */}
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-2">{wallpaper.title}</h2>
                <div className="flex items-center space-x-4 text-sm opacity-90">
                  <span>{wallpaper.resolution}</span>
                  <span>•</span>
                  <span>{wallpaper.size}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span>{wallpaper.rating}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFavorite}
                  className={`bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 ${
                    isFavorited ? "bg-red-500/50 hover:bg-red-500/70" : ""
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isFavorited ? "fill-current" : ""
                    }`}
                  />
                  {isFavorited ? "Favorited" : "Favorite"}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>

                <Button
                  size="sm"
                  onClick={handleSetWallpaper}
                  disabled={isSettingWallpaper}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50"
                >
                  {isSettingWallpaper ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Monitor className="w-4 h-4 mr-2" />
                  )}
                  {isSettingWallpaper ? "Setting..." : "Set as Wallpaper"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
