"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WallpaperSettings {
  // Content Filtering
  contentFilter: "sfw" | "sfw-sketchy" | "all"; // SFW only, SFW + Sketchy, All content
  workspaceMode: boolean; // Extra safe mode for workplace

  // Quality & Performance
  preferredResolution: "any" | "1920x1080" | "2560x1440" | "3840x2160";
  imageQuality: "thumbnail" | "small" | "large" | "original";

  // Source Preferences
  enabledSources: string[]; // Which sources to fetch from

  // Professional Features
  blurNonSafeContent: boolean; // Blur potentially inappropriate content
  hideExplicitTags: boolean; // Hide explicit tags in UI
  professionalMode: boolean; // Overall professional mode toggle

  // Cache & Performance
  enableBackgroundRefresh: boolean;
  maxCacheSize: number; // in MB
}

interface SettingsContextType {
  settings: WallpaperSettings;
  updateSettings: (updates: Partial<WallpaperSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultSettings: WallpaperSettings = {
  contentFilter: "sfw",
  workspaceMode: true,
  preferredResolution: "any",
  imageQuality: "large",
  enabledSources: ["wallhaven"],
  blurNonSafeContent: true,
  hideExplicitTags: true,
  professionalMode: true,
  enableBackgroundRefresh: true,
  maxCacheSize: 50,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WallpaperSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("wallpaper-settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("wallpaper-settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<WallpaperSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const parsed = JSON.parse(settingsJson);
      setSettings({ ...defaultSettings, ...parsed });
      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      return false;
    }
  };

  const value = {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
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
