"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorFiltersProps {
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
  isLoading?: boolean;
}

// Wallhaven color palette
const WALLHAVEN_COLORS = [
  { hex: "#660000", name: "Dark Red" },
  { hex: "#990000", name: "Red" },
  { hex: "#cc0000", name: "Bright Red" },
  { hex: "#cc3333", name: "Light Red" },
  { hex: "#ea4c88", name: "Pink" },
  { hex: "#993399", name: "Purple" },
  { hex: "#663399", name: "Dark Purple" },
  { hex: "#333399", name: "Blue Purple" },
  { hex: "#0066cc", name: "Blue" },
  { hex: "#0099cc", name: "Light Blue" },
  { hex: "#66cccc", name: "Cyan" },
  { hex: "#77cc33", name: "Light Green" },
  { hex: "#669900", name: "Green" },
  { hex: "#336600", name: "Dark Green" },
  { hex: "#666600", name: "Olive" },
  { hex: "#999900", name: "Yellow Green" },
  { hex: "#cccc33", name: "Light Yellow" },
  { hex: "#ffff00", name: "Yellow" },
  { hex: "#ffcc33", name: "Orange Yellow" },
  { hex: "#ff9900", name: "Orange" },
  { hex: "#ff6600", name: "Red Orange" },
  { hex: "#cc6633", name: "Brown Orange" },
  { hex: "#996633", name: "Brown" },
  { hex: "#663300", name: "Dark Brown" },
  { hex: "#000000", name: "Black" },
  { hex: "#999999", name: "Gray" },
  { hex: "#cccccc", name: "Light Gray" },
  { hex: "#ffffff", name: "White" },
  { hex: "#424153", name: "Dark Gray Blue" },
];

export function ColorFilters({
  selectedColors,
  onColorChange,
  isLoading = false,
}: ColorFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleColor = (colorHex: string) => {
    const colorValue = colorHex.substring(1); // Remove #
    if (selectedColors.includes(colorValue)) {
      onColorChange(selectedColors.filter((c) => c !== colorValue));
    } else {
      onColorChange([...selectedColors, colorValue]);
    }
  };

  const clearAllColors = () => {
    onColorChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Color Filter Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-9 relative button-hover"
        disabled={isLoading}
      >
        <Palette className="w-4 h-4" />
        Colors
        {selectedColors.length > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
            {selectedColors.length}
          </Badge>
        )}
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/* Color Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[420px] max-w-[90vw] border rounded-lg bg-card dropdown-shadow animate-in lg:left-0 md:left-auto md:right-0">
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Select Colors</Label>
              {selectedColors.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllColors}
                  className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                  disabled={isLoading}
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-10 gap-1.5 p-3 bg-muted/30 rounded-lg">
              {WALLHAVEN_COLORS.map((color) => (
                <button
                  key={color.hex}
                  className={cn(
                    "w-6 h-6 rounded-md border-2 transition-all duration-200 hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
                    selectedColors.includes(color.hex.substring(1))
                      ? "border-primary shadow-lg scale-110 ring-2 ring-primary/20"
                      : "border-border hover:border-foreground/40"
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  onClick={() => toggleColor(color.hex)}
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Selected Colors Display */}
            {selectedColors.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {selectedColors.map((color) => {
                  const colorInfo = WALLHAVEN_COLORS.find(
                    (c) => c.hex === `#${color}`
                  );
                  return (
                    <Badge
                      key={color}
                      variant="secondary"
                      className="text-xs gap-2 pr-1"
                    >
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: `#${color}` }}
                      />
                      {colorInfo?.name || color}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-4 h-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() =>
                          onColorChange(
                            selectedColors.filter((c) => c !== color)
                          )
                        }
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
