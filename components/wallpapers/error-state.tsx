"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: Error;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div>
          <h3 className="font-semibold text-red-800 dark:text-red-200">
            Connection Error
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300">
            {error.message}. Showing cached results if available.
          </p>
        </div>
      </div>
    </div>
  );
} 