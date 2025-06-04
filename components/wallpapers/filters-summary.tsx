"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AdvancedFilters } from "./advanced-filters";

interface FiltersSummaryProps {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  selectedColors: string[];
  advancedFilters: AdvancedFilters;
  onClearFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

export function FiltersSummary({
  searchQuery,
  selectedCategory,
  sortBy,
  selectedColors,
  advancedFilters,
  onClearFilter,
  onClearAll,
}: FiltersSummaryProps) {
  const hasFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    sortBy !== "date_added" ||
    selectedColors.length > 0 ||
    advancedFilters.exactResolutions.length > 0 ||
    advancedFilters.aspectRatios.length > 0 ||
    advancedFilters.minResolution;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Active Filters:
      </span>

      {/* Search Query */}
      {searchQuery && (
        <Badge variant="secondary" className="gap-1">
          Search: &quot;{searchQuery}&quot;
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearFilter("search")}
          />
        </Badge>
      )}

      {/* Category */}
      {selectedCategory !== "All" && (
        <Badge variant="secondary" className="gap-1">
          Category: {selectedCategory}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearFilter("category")}
          />
        </Badge>
      )}

      {/* Sort */}
      {sortBy !== "date_added" && (
        <Badge variant="secondary" className="gap-1">
          Sort: {sortBy.replace("_", " ")}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearFilter("sort")}
          />
        </Badge>
      )}

      {/* Minimum Resolution */}
      {advancedFilters.minResolution && (
        <Badge variant="outline" className="gap-1">
          Min: {advancedFilters.minResolution}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearFilter("minResolution")}
          />
        </Badge>
      )}

      {/* Exact Resolutions */}
      {advancedFilters.exactResolutions.map((res) => (
        <Badge key={res} variant="outline" className="gap-1">
          Resolution: {res}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearFilter("exactResolutions", res)}
          />
        </Badge>
      ))}

      {/* Aspect Ratios */}
      {advancedFilters.aspectRatios.map((ratio) => (
        <Badge key={ratio} variant="outline" className="gap-1">
          Ratio: {ratio}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearFilter("aspectRatios", ratio)}
          />
        </Badge>
      ))}

      {/* Colors */}
      {selectedColors.map((color) => (
        <Badge key={color} variant="outline" className="gap-1">
          <div
            className="w-3 h-3 rounded border mr-1"
            style={{ backgroundColor: `#${color}` }}
          />
          Color
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => onClearFilter("colors", color)}
          />
        </Badge>
      ))}

      {/* Clear All Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="ml-auto text-muted-foreground hover:text-foreground"
      >
        Clear All
      </Button>
    </div>
  );
}
