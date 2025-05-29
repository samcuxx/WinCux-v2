"use client";

import React from "react";

interface ResultsCountProps {
  count: number;
  selectedCategory: string;
  searchQuery: string;
}

export function ResultsCount({
  count,
  selectedCategory,
  searchQuery,
}: ResultsCountProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Showing {count} wallpapers
        {selectedCategory !== "All" && ` in ${selectedCategory}`}
        {searchQuery && ` matching "${searchQuery}"`}
      </span>
    </div>
  );
}
