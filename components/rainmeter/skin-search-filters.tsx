import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface SkinSearchFiltersProps {
  searchQuery: string;
  sortBy: "name" | "rating" | "downloads" | "last_updated" | "file_size";
  isLoading: boolean;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onSortChange: (sorting: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const sortingOptions = [
  { value: "rating", label: "Rating" },
  { value: "downloads", label: "Downloads" },
  { value: "last_updated", label: "Recently Updated" },
  { value: "name", label: "Name" },
  { value: "file_size", label: "File Size" },
];

export function SkinSearchFilters({
  searchQuery,
  sortBy,
  isLoading,
  onSearchQueryChange,
  onSearch,
  onSortChange,
  onKeyPress,
}: SkinSearchFiltersProps) {
  const clearSearch = () => {
    onSearchQueryChange("");
    onSearch();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search skins by name, developer, tags, or description..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="pl-10 pr-10 h-11 text-base"
            disabled={isLoading}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Button
          onClick={onSearch}
          disabled={isLoading}
          className="h-11 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
          </div>

          <Select
            value={sortBy}
            onValueChange={onSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Status */}
        {searchQuery && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Searching for:</span>
            <span className="font-medium text-foreground">"{searchQuery}"</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
