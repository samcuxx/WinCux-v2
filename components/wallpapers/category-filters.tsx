"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string;
  isLoading: boolean;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilters({
  categories,
  selectedCategory,
  isLoading,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-sm font-medium text-muted-foreground shrink-0">
        Categories:
      </span>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            disabled={isLoading}
            className={`h-9 shrink-0 button-hover ${
              selectedCategory === category
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                : "hover:bg-muted/80"
            }`}
          >
            {category}
            {selectedCategory === category && (
              <Badge
                variant="secondary"
                className="ml-2 bg-white/20 text-white border-0"
              >
                ✓
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
