"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

interface LoadMoreButtonProps {
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function LoadMoreButton({
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}: LoadMoreButtonProps) {
  if (!hasNextPage) return null;

  return (
    <div className="flex justify-center py-8">
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
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
  );
}
