"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Database,
  Clock,
} from "lucide-react";

interface CacheStatsPanelProps {
  isVisible: boolean;
  cacheStats: {
    totalEntries: number;
    totalSize: string;
    lastUpdate?: Date;
    isHealthy: boolean;
  };
  onClearCache: () => void;
}

export function CacheStatsPanel({ isVisible, cacheStats, onClearCache }: CacheStatsPanelProps) {
  if (!isVisible) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Cache Statistics
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCache}
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
  );
} 