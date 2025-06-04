"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Minimize2,
  Square,
  X,
  Sun,
  Moon,
  Monitor,
  Palette,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
} from "lucide-react";

interface TopBarProps {
  title?: string;
}

interface NotificationState {
  id: string;
  type: "loading" | "success" | "error" | "info";
  message: string;
  subMessage?: string;
  timestamp: number;
}

// Global notification state
let globalNotificationState: NotificationState | null = null;
let notificationListeners: ((
  notification: NotificationState | null
) => void)[] = [];

// Global notification functions
export const showTopBarNotification = (
  notification: Omit<NotificationState, "id" | "timestamp">
) => {
  const newNotification: NotificationState = {
    ...notification,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  globalNotificationState = newNotification;
  notificationListeners.forEach((listener) => listener(newNotification));

  // Auto-hide success and error notifications after 4 seconds
  if (notification.type === "success" || notification.type === "error") {
    setTimeout(() => {
      hideTopBarNotification();
    }, 4000);
  }

  return newNotification.id;
};

export const updateTopBarNotification = (
  id: string,
  updates: Partial<NotificationState>
) => {
  if (globalNotificationState && globalNotificationState.id === id) {
    globalNotificationState = { ...globalNotificationState, ...updates };
    notificationListeners.forEach((listener) =>
      listener(globalNotificationState)
    );

    // Auto-hide if updated to success or error
    if (updates.type === "success" || updates.type === "error") {
      setTimeout(() => {
        hideTopBarNotification();
      }, 4000);
    }
  }
};

export const hideTopBarNotification = () => {
  globalNotificationState = null;
  notificationListeners.forEach((listener) => listener(null));
};

export function TopBar({ title }: TopBarProps) {
  const [isElectron, setIsElectron] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(
      typeof window !== "undefined" && window.electronAPI !== undefined
    );
    setMounted(true);

    // Subscribe to global notification updates
    const handleNotificationUpdate = (
      newNotification: NotificationState | null
    ) => {
      setNotification(newNotification);
    };

    notificationListeners.push(handleNotificationUpdate);

    // Cleanup subscription
    return () => {
      const index = notificationListeners.indexOf(handleNotificationUpdate);
      if (index > -1) {
        notificationListeners.splice(index, 1);
      }
    };
  }, []);

  const handleWindowControl = async (
    action: "minimize" | "maximize" | "close"
  ) => {
    if (!isElectron) return;

    try {
      switch (action) {
        case "minimize":
          await window.electronAPI.minimizeWindow();
          break;
        case "maximize":
          await window.electronAPI.maximizeWindow();
          break;
        case "close":
          await window.electronAPI.closeWindow();
          break;
      }
    } catch (error) {
      console.error("Window control error:", error);
    }
  };

  const handleThemeToggle = () => {
    if (!mounted) return;

    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
      //   setTheme("system");
      //   break;
      // case "system":
      default:
        setTheme("light");
        break;
    }
  };

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-4 w-4" />;

    if (theme === "system") {
      return <Monitor className="h-4 w-4 text-gray-500" />;
    }

    switch (resolvedTheme) {
      case "light":
        return <Sun className="h-4 w-4 text-amber-500" />;
      case "dark":
        return <Moon className="h-4 w-4 text-blue-400" />;
      // default:
      //   return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCurrentThemeLabel = () => {
    if (!mounted) return "System";

    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
      default:
        return "System";
    }
  };

  const getNotificationIcon = (type: NotificationState["type"]) => {
    switch (type) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "info":
        return <AlertCircle className="h-4 w-4 text-violet-500" />;
      default:
        return null;
    }
  };

  const getNotificationGradient = (type: NotificationState["type"]) => {
    switch (type) {
      case "loading":
        return "animate-gradient-x bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent";
      case "success":
        return "animate-gradient-x bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 bg-clip-text text-transparent";
      case "error":
        return "animate-gradient-x bg-gradient-to-r from-rose-500 via-red-500 to-rose-500 bg-clip-text text-transparent";
      case "info":
        return "animate-gradient-x bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 bg-clip-text text-transparent";
      default:
        return "";
    }
  };

  return (
    <div
      className="flex items-center justify-between h-12 px-6 bg-background/80"
      style={{ WebkitAppRegion: "drag" } as any}
    >
      {/* Left side - App info */}
      <div className="flex items-center">
        {/* Left side - Professional Notification Area */}
        {notification && (
          <div
            className="flex items-center space-x-3 px-4 py-1.5 rounded-lg transition-all duration-500 animate-fade-in"
            style={{ WebkitAppRegion: "no-drag" } as any}
          >
            <div className="animate-bounce-subtle">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${getNotificationGradient(notification.type)}`}>
                {notification.message}
              </span>
              {notification.subMessage && (
                <span className={`text-xs ml-2 ${getNotificationGradient(notification.type)}`}>
                  {notification.subMessage}
                </span>
              )}
            </div>
            {notification.type !== "loading" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/10 rounded-full"
                onClick={hideTopBarNotification}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right side - Theme toggle and window controls */}
      <div
        className="flex items-center space-x-2"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        {/* Professional Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 hover:bg-accent hover:text-accent-foreground rounded-md transition-all duration-200 relative group"
          onClick={handleThemeToggle}
          title={`Current theme: ${getCurrentThemeLabel()}`}
        >
          <div className="relative">
            {getThemeIcon()}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </div>
        </Button>

        {/* Window Controls */}
        {isElectron && (
          <>
            <div className="w-px h-4 bg-border/50 mx-1"></div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 hover:bg-yellow-500/20 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-md transition-all duration-200"
                onClick={() => handleWindowControl("minimize")}
                title="Minimize"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 rounded-md transition-all duration-200"
                onClick={() => handleWindowControl("maximize")}
                title="Maximize"
              >
                <Square className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-all duration-200"
                onClick={() => handleWindowControl("close")}
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
