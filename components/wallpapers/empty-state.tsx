"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold mb-2">No wallpapers found</h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your search terms or filters
      </p>
      <Button onClick={onClearFilters}>Clear Filters</Button>
    </div>
  );
}
