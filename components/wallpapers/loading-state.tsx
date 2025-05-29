"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="text-center py-12">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
      <h3 className="text-lg font-semibold mb-2">Loading wallpapers...</h3>
      <p className="text-muted-foreground">
        Fetching high-quality wallpapers from Wallhaven
      </p>
    </div>
  );
}
