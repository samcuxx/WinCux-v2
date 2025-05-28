"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  SortAsc,
  Eye,
  Heart,
  Download,
  RefreshCw,
} from "lucide-react";

export function WallpapersPage() {
  const categories = [
    "All",
    "Nature",
    "Abstract",
    "City",
    "Space",
    "Minimalist",
    "Dark",
    "Gaming",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Wallpaper Gallery
          </h2>
          <p className="text-muted-foreground mt-1">
            Discover stunning wallpapers for your desktop
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={
              selectedCategory === category
                ? "bg-gradient-to-r from-blue-600 to-purple-600"
                : ""
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Wallpaper Grid */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card
            key={i}
            className="border-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm"
          >
            <div className="relative aspect-video bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 to-purple-800">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Heart className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Badge className="absolute top-2 left-2 bg-black/60 text-white border-0">
                4K
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Wallpaper {i + 1}</h3>
                  <p className="text-xs text-muted-foreground">
                    3840×2160 •{" "}
                    {categories[Math.floor(Math.random() * categories.length)]}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-8">
        <Button variant="outline" size="lg">
          <RefreshCw className="w-4 h-4 mr-2" />
          Load More Wallpapers
        </Button>
      </div>
    </div>
  );
}
