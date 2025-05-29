"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  HardDrive,
  Grid3X3,
  List,
  Shield,
} from "lucide-react";
import { useSettings } from "@/lib/contexts/settings-context";

interface WallpaperHeaderProps {
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  isFromCache: boolean;
  cacheAge?: number;
  viewMode: "grid" | "list";
  showCacheStats: boolean;
  onRefresh: () => void;
  onToggleCacheStats: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function WallpaperHeader({
  isLoading,
  error,
  totalCount,
  isFromCache,
  cacheAge,
  viewMode,
  showCacheStats,
  onRefresh,
  onToggleCacheStats,
  onViewModeChange,
}: WallpaperHeaderProps) {
  const { allowNSFW } = useSettings();

  const formatCacheAge = (ageMs?: number): string => {
    if (!ageMs) return "";
    const minutes = Math.floor(ageMs / (1000 * 60));
    const seconds = Math.floor((ageMs % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
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
          onClick={onToggleCacheStats}
          title="Cache statistics"
        >
          <HardDrive className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh wallpapers"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
          title="Grid view"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          title="List view"
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
