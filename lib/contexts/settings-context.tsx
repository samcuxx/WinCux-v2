"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { wallpaperProvider } from "@/lib/providers/wallpaper-provider";

interface SettingsContextType {
  // NSFW Filter Settings
  allowNSFW: boolean;
  setAllowNSFW: (allow: boolean) => void;

  // Purity settings for API
  getPuritySetting: () => string;

  // Other potential settings
  cacheEnabled: boolean;
  setCacheEnabled: (enabled: boolean) => void;

  // Cache management (unified with wallpapers page)
  clearCache: () => void;
  getCacheStats: () => any;

  // Reset all settings
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Default settings
const DEFAULT_SETTINGS = {
  allowNSFW: false,
  cacheEnabled: true,
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [allowNSFW, setAllowNSFWState] = useState(DEFAULT_SETTINGS.allowNSFW);
  const [cacheEnabled, setCacheEnabledState] = useState(
    DEFAULT_SETTINGS.cacheEnabled
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("wallpaper-app-settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setAllowNSFWState(parsed.allowNSFW ?? DEFAULT_SETTINGS.allowNSFW);
          setCacheEnabledState(
            parsed.cacheEnabled ?? DEFAULT_SETTINGS.cacheEnabled
          );
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return; // Don't save until we've loaded initial settings

    const settings = {
      allowNSFW,
      cacheEnabled,
    };

    try {
      localStorage.setItem("wallpaper-app-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [allowNSFW, cacheEnabled, isLoaded]);

  const setAllowNSFW = (allow: boolean) => {
    console.log("NSFW setting changing from", allowNSFW, "to", allow);
    setAllowNSFWState(allow);

    // Clear cache immediately when NSFW setting changes
    wallpaperProvider.clearCache();

    // Dispatch event to notify wallpaper components
    try {
      const event = new CustomEvent("nsfw-setting-changed", {
        detail: {
          allowNSFW: allow,
          puritySetting: allow ? "111" : "100",
        },
      });
      window.dispatchEvent(event);
      console.log("Dispatched NSFW setting change event");
    } catch (error) {
      console.error("Failed to dispatch NSFW setting change event:", error);
    }
  };

  const setCacheEnabled = (enabled: boolean) => {
    setCacheEnabledState(enabled);
  };

  // Get purity setting for Wallhaven API
  const getPuritySetting = (): string => {
    if (allowNSFW) {
      return "111"; // SFW + Sketchy + NSFW
    }
    return "100"; // SFW only
  };

  // Unified cache management
  const clearCache = () => {
    wallpaperProvider.clearCache();
    console.log("Cache cleared from settings context");
  };

  const getCacheStats = () => {
    return wallpaperProvider.getCacheStats();
  };

  const resetSettings = () => {
    setAllowNSFWState(DEFAULT_SETTINGS.allowNSFW);
    setCacheEnabledState(DEFAULT_SETTINGS.cacheEnabled);

    // Clear cache when resetting settings
    wallpaperProvider.clearCache();

    // Clear localStorage
    try {
      localStorage.removeItem("wallpaper-app-settings");
    } catch (error) {
      console.error("Failed to clear settings:", error);
    }

    // Dispatch event for reset
    try {
      const event = new CustomEvent("nsfw-setting-changed", {
        detail: {
          allowNSFW: DEFAULT_SETTINGS.allowNSFW,
          puritySetting: "100",
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to dispatch reset event:", error);
    }
  };

  const contextValue: SettingsContextType = {
    allowNSFW,
    setAllowNSFW,
    getPuritySetting,
    cacheEnabled,
    setCacheEnabled,
    clearCache,
    getCacheStats,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
