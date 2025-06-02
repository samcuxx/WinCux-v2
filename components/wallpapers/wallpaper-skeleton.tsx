"use client";

import React from "react";
import { Card } from "@/components/ui/card";

interface WallpaperSkeletonProps {
  count?: number;
  viewMode?: "grid" | "list";
}

function SkeletonCard({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <Card className="group border-0 overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg">
      <div
        className={`relative w-full ${
          viewMode === "list" ? "h-48" : "aspect-[3/2]"
        } overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800`}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer transform -skew-x-12"></div>

        {/* Placeholder content that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 lg:p-5 xl:p-6">
          {/* Bottom overlay placeholder */}
          <div className="w-full space-y-2 animate-pulse">
            {/* Category and resolution placeholders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-16 bg-white/30 rounded"></div>
                <div className="h-4 w-20 bg-white/30 rounded"></div>
              </div>
              <div className="h-5 w-12 bg-white/30 rounded"></div>
            </div>

            {/* Action buttons placeholder */}
            <div className="flex items-center justify-center space-x-2 lg:space-x-3">
              <div className="h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 bg-white/30 rounded-full"></div>
              <div className="h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 bg-white/30 rounded-full"></div>
              <div className="h-9 w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function WallpaperSkeleton({
  count = 24,
  viewMode = "grid",
}: WallpaperSkeletonProps) {
  return (
    <div
      className={`${
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8"
          : "grid grid-cols-1 gap-4"
      } w-full`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} viewMode={viewMode} />
      ))}
    </div>
  );
}
