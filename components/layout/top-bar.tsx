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
} from "lucide-react";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const [isElectron, setIsElectron] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(
      typeof window !== "undefined" && window.electronAPI !== undefined
    );
    setMounted(true);
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
        setTheme("system");
        break;
      case "system":
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
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
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

  return (
    <div
      className="flex items-center justify-between h-12 px-6 bg-background/80"
      style={{ WebkitAppRegion: "drag" } as any}
    >
      {/* Left side - App info */}
      <div className="flex items-center space-x-3"></div>

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
