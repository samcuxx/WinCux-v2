"use client";

import React from "react";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          disabled={isLoading}
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
  );
}
