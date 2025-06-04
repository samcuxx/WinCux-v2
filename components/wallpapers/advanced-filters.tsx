"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  X,
  Monitor,
  Palette,
  Filter,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdvancedFilters {
  // Resolution filters
  minResolution?: string;
  exactResolutions: string[];

  // Aspect ratio filters
  aspectRatios: string[];
}

interface AdvancedFiltersProps {
  isVisible: boolean;
  filters: AdvancedFilters;
  isLoading: boolean;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onToggle: () => void;
  onApply: () => void;
  onReset: () => void;
}

// Predefined filter options based on Wallhaven API
const COMMON_RESOLUTIONS = [
  "1920x1080",
  "2560x1440",
  "3840x2160",
  "1366x768",
  "1680x1050",
  "1920x1200",
  "2560x1080",
  "3440x1440",
];

const ASPECT_RATIOS = [
  { value: "16x9", label: "16:9 (Widescreen)" },
  { value: "16x10", label: "16:10" },
  { value: "21x9", label: "21:9 (Ultrawide)" },
  { value: "4x3", label: "4:3" },
  { value: "5x4", label: "5:4" },
  { value: "3x2", label: "3:2" },
  { value: "32x9", label: "32:9 (Super Ultrawide)" },
];

export function AdvancedFilters({
  isVisible,
  filters,
  isLoading,
  onFiltersChange,
  onToggle,
  onApply,
  onReset,
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onToggle]);

  const updateFilters = (updates: Partial<AdvancedFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const addToArray = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    if (!currentArray.includes(value)) {
      updateFilters({ [key]: [...currentArray, value] });
    }
  };

  const removeFromArray = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    updateFilters({ [key]: currentArray.filter((item) => item !== value) });
  };

  const hasActiveFilters = () => {
    return (
      localFilters.minResolution ||
      localFilters.exactResolutions.length > 0 ||
      localFilters.aspectRatios.length > 0
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2 h-9 button-hover"
          disabled={isLoading}
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {hasActiveFilters() && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {[
                localFilters.exactResolutions.length,
                localFilters.aspectRatios.length,
                localFilters.minResolution ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </Badge>
          )}
          {isVisible ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground h-9"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isVisible && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[600px] max-w-[90vw] border rounded-lg bg-card dropdown-shadow animate-in lg:left-0 md:left-auto md:right-0">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resolution Filters */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <Monitor className="w-4 h-4 inline mr-2" />
                    Resolution Filters
                  </Label>

                  {/* Minimum Resolution */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Minimum Resolution
                    </Label>
                    <Select
                      value={localFilters.minResolution || "none"}
                      onValueChange={(value) =>
                        updateFilters({
                          minResolution: value === "none" ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No minimum</SelectItem>
                        {COMMON_RESOLUTIONS.map((res) => (
                          <SelectItem key={res} value={res}>
                            {res}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Exact Resolutions */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Exact Resolutions
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        addToArray("exactResolutions", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add exact resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_RESOLUTIONS.filter(
                          (res) => !localFilters.exactResolutions.includes(res)
                        ).map((res) => (
                          <SelectItem key={res} value={res}>
                            {res}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {localFilters.exactResolutions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {localFilters.exactResolutions.map((res) => (
                          <Badge
                            key={res}
                            variant="secondary"
                            className="text-xs"
                          >
                            {res}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() =>
                                removeFromArray("exactResolutions", res)
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Aspect Ratios */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Aspect Ratios
                  </Label>
                  <Select
                    onValueChange={(value) => addToArray("aspectRatios", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.filter(
                        (ratio) =>
                          !localFilters.aspectRatios.includes(ratio.value)
                      ).map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {localFilters.aspectRatios.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {localFilters.aspectRatios.map((ratio) => (
                        <Badge
                          key={ratio}
                          variant="secondary"
                          className="text-xs"
                        >
                          {ASPECT_RATIOS.find((r) => r.value === ratio)
                            ?.label || ratio}
                          <X
                            className="w-3 h-3 ml-1 cursor-pointer"
                            onClick={() =>
                              removeFromArray("aspectRatios", ratio)
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-end pt-4 border-t gap-2">
              <Button
                variant="outline"
                onClick={onToggle}
                disabled={isLoading}
                className="h-9"
              >
                Close
              </Button>
              <Button
                onClick={onApply}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-9"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
