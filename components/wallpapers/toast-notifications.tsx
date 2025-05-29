"use client";

import React from "react";
import { Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "loading";
  message: string;
  subMessage?: string;
}

interface ToastNotificationsProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

export function ToastNotifications({
  toasts,
  onRemoveToast,
}: ToastNotificationsProps) {
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
              : "bg-blue-500/90 border-blue-400 text-white"
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
            <div className="mt-3 w-full bg-white/20 rounded-full h-1">
              <div className="bg-white h-1 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
