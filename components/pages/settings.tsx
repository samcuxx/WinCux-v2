"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings } from "@/lib/contexts/settings-context";
import { UpdateSettings } from "@/components/ui/update-settings";
import {
  Settings,
  Shield,
  HardDrive,
  RotateCcw,
  AlertTriangle,
  Info,
  Database,
  Eye,
  EyeOff,
} from "lucide-react";

export function SettingsPage() {
  const {
    allowNSFW,
    setAllowNSFW,
    cacheEnabled,
    setCacheEnabled,
    clearCache,
    getCacheStats,
    resetSettings,
  } = useSettings();

  const [isClient, setIsClient] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    totalSize: "0 MB",
    isHealthy: true,
    lastUpdate: null,
  });

  useEffect(() => {
    setIsClient(true);
    setCacheStats(getCacheStats());
  }, [getCacheStats]);

  const handleResetSettings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to default? This action cannot be undone."
      )
    ) {
      resetSettings();
    }
  };

  const handleClearCache = () => {
    clearCache();
    setCacheStats(getCacheStats());
    // Show a brief success message or notification if desired
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Application Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Customize your experience and manage application preferences
        </p>
      </div>

      {/* Content Filter Settings */}
      <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Shield className="w-5 h-5" />
            Content Filter
          </CardTitle>
          <CardDescription>
            Control what type of wallpaper content is displayed from Wallhaven
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/60 dark:bg-gray-900/60 border border-amber-200 dark:border-amber-700">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  allowNSFW
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-green-100 dark:bg-green-900/30"
                }`}
              >
                {allowNSFW ? (
                  <EyeOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Allow NSFW Content
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  When enabled, allows adult content and sketchy wallpapers from
                  Wallhaven. When disabled, only SFW (Safe for Work) content is
                  shown.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      allowNSFW ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Currently: {allowNSFW ? "All Content" : "SFW Only"}
                  </span>
                </div>
              </div>
            </div>
            <Switch
              checked={allowNSFW}
              onCheckedChange={setAllowNSFW}
              className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500"
            />
          </div>

          {allowNSFW && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">
                  Adult Content Enabled
                </p>
                <p className="text-red-700 dark:text-red-300 mt-1">
                  NSFW content is now visible. Use this setting responsibly and
                  ensure it is appropriate for your environment.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cache Settings */}
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Database className="w-5 h-5" />
            Cache Settings
          </CardTitle>
          <CardDescription>
            Manage how wallpaper data is cached for faster loading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/60 dark:bg-gray-900/60 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  cacheEnabled
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-900/30"
                }`}
              >
                <HardDrive
                  className={`w-5 h-5 ${
                    cacheEnabled
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Enable Caching
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Cache wallpaper data locally for faster loading and offline
                  access. Recommended for better performance.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      cacheEnabled ? "bg-blue-500" : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Currently: {cacheEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
            <Switch
              checked={cacheEnabled}
              onCheckedChange={setCacheEnabled}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          {/* Cache Statistics */}
          {isClient && (
            <div className="p-4 rounded-lg bg-white/60 dark:bg-gray-900/60 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Cache Statistics
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Clear Cache
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Entries:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {cacheStats.totalEntries}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Size:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {cacheStats.totalSize}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      cacheStats.isHealthy ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`font-medium ${
                      cacheStats.isHealthy ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {cacheStats.isHealthy ? "Healthy" : "Needs Cleanup"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Last Update:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {cacheStats.lastUpdate
                      ? new Intl.DateTimeFormat("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(cacheStats.lastUpdate)
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Settings */}
      <UpdateSettings />

      {/* About & Reset */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Application information and reset options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* App Info */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Application Info
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <p>Wallpaper & Rainmeter Manager v1.0.0</p>
                <p>Built with Electron, Next.js, and Tailwind CSS</p>
                <p>Using Wallhaven API for wallpaper content</p>
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Reset All Settings
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Reset all application settings to their default values. This
                  will also clear all cached data.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetSettings}
              className="shrink-0"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
