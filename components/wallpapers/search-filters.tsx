"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronDown } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  sortBy: string;
  isLoading: boolean;
  sortingOptions: Array<{ value: string; label: string }>;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onSortChange: (sorting: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function SearchFilters({
  searchQuery,
  sortBy,
  isLoading,
  sortingOptions,
  onSearchQueryChange,
  onSearch,
  onSortChange,
  onKeyPress,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search wallpapers, tags, or authors..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={onKeyPress}
          className="pl-10"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={onSearch}
          disabled={isLoading}
          title="Search wallpapers"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            title="Sort wallpapers by"
            disabled={isLoading}
          >
            {sortingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
