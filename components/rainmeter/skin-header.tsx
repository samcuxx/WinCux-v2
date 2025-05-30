import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Download,
  Grid3x3,
  List,
  BarChart3,
  Clock,
  Database,
  ExternalLink,
} from "lucide-react";

interface SkinHeaderProps {
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  isFromCache: boolean;
  cacheAge?: number;
  viewMode: "grid" | "list";
  showCacheStats: boolean;
  onRefresh: () => Promise<void>;
  onToggleCacheStats: () => void;
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function SkinHeader({
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
}: SkinHeaderProps) {
  const formatCacheAge = (ageMs: number): string => {
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rainmeter Skins
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and install beautiful Rainmeter skins for your desktop
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Cache Stats Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCacheStats}
            className={showCacheStats ? "bg-blue-50 dark:bg-blue-950" : ""}
          >
            <Database className="w-4 h-4 mr-2" />
            Cache
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="h-8 px-3"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="h-8 px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
        <div className="flex items-center space-x-4">
          {/* Total Count */}
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">
              {totalCount.toLocaleString()} skins available
            </span>
          </div>

          {/* Cache Status */}
          {isFromCache && cacheAge !== undefined && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-500" />
              <Badge variant="secondary" className="text-xs">
                Cached {formatCacheAge(cacheAge)} ago
              </Badge>
            </div>
          )}

          {/* Error Status */}
          {error && (
            <Badge variant="destructive" className="text-xs">
              Error: {error.message}
            </Badge>
          )}
        </div>

        {/* Additional Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() =>
              window.open("https://www.deviantart.com/rainmeter", "_blank")
            }
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Browse DeviantArt
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => window.open("https://docs.rainmeter.net/", "_blank")}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
