"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Download, Heart } from "lucide-react";
import { LocalWallpaper } from "@/types/wallhaven";

interface WallpaperGridProps {
  wallpapers: LocalWallpaper[];
  viewMode: "grid" | "list";
  downloadedWallpapers: Set<string>;
  onWallpaperClick: (wallpaper: LocalWallpaper) => void;
  onSetWallpaper: (wallpaper: LocalWallpaper, e: React.MouseEvent) => void;
  onDownload: (wallpaper: LocalWallpaper, e: React.MouseEvent) => void;
  onFavorite: (wallpaper: LocalWallpaper, e: React.MouseEvent) => void;
}

export function WallpaperGrid({
  wallpapers,
  viewMode,
  downloadedWallpapers,
  onWallpaperClick,
  onSetWallpaper,
  onDownload,
  onFavorite,
}: WallpaperGridProps) {
  return (
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
          onClick={() => onWallpaperClick(wallpaper)}
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
                    onSetWallpaper(wallpaper, e);
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
                    onClick={(e) => onDownload(wallpaper, e)}
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
                    onFavorite(wallpaper, e);
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
  );
}
