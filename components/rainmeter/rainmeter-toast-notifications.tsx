"use client";

import React from "react";
import { Loader2, CheckCircle, AlertCircle, X, Info } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "loading" | "info";
  message: string;
  subMessage?: string;
}

interface RainmeterToastNotificationsProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

export function RainmeterToastNotifications({
  toasts,
  onRemoveToast,
}: RainmeterToastNotificationsProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start space-x-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border max-w-sm transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500/90 border-green-400 text-white"
              : toast.type === "error"
              ? "bg-red-500/90 border-red-400 text-white"
              : toast.type === "info"
              ? "bg-blue-500/90 border-blue-400 text-white"
              : "bg-purple-500/90 border-purple-400 text-white"
          }`}
        >
          {toast.type === "loading" && (
            <Loader2 className="w-5 h-5 animate-spin mt-0.5 shrink-0" />
          )}
          {toast.type === "success" && (
            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 mt-0.5 shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{toast.message}</p>
            {toast.subMessage && (
              <p className="text-xs opacity-90 mt-1">{toast.subMessage}</p>
            )}
          </div>

          {toast.type !== "loading" && (
            <button
              onClick={() => onRemoveToast(toast.id)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Progress bar for loading toasts */}
          {toast.type === "loading" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
              <div className="h-full bg-white/60 animate-pulse w-full"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
