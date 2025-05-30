"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Plus,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RainmeterSkin } from "@/types/rainmeter";
import { useRainmeterSkins } from "@/hooks/use-rainmeter-skins";
import { useRainmeterToasts } from "@/hooks/use-rainmeter-toasts";
import { rainmeterSkinsAPI } from "@/lib/services/rainmeter-skins-api";
import { rainmeterStorage } from "@/lib/services/rainmeter-storage";
import { SkinHeader } from "@/components/rainmeter/skin-header";
import { SkinSearchFilters } from "@/components/rainmeter/skin-search-filters";
import { SkinGrid } from "@/components/rainmeter/skin-grid";
import { SkinModal } from "@/components/ui/skin-modal";
import { SkinConfigModal } from "@/components/ui/skin-config-modal";
import { RainmeterToastNotifications } from "@/components/rainmeter/rainmeter-toast-notifications";

export function RainmeterPage() {
  const [rainmeterStatus, setRainmeterStatus] = useState<
    "checking" | "installed" | "not_installed"
  >("checking");
  const [installationState, setInstallationState] = useState<
    "idle" | "installing" | "success" | "error"
  >("idle");
  const [installProgress, setInstallProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Skin management state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<
    "name" | "rating" | "downloads" | "last_updated" | "file_size"
  >("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSkin, setSelectedSkin] = useState<RainmeterSkin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [installedSkins, setInstalledSkins] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [showCacheStats, setShowCacheStats] = useState(false);

  // Use the skins hook
  const {
    skins,
    isLoading,
    error: skinsError,
    totalCount,
    hasNextPage,
    refresh,
    loadMore,
    search,
    clearCache: clearSkinsCache,
    getCacheStats,
    isFromCache,
    cacheAge,
    isLoadingMore,
  } = useRainmeterSkins({
    sorting: sortBy,
    category: selectedCategory,
    query: searchQuery,
    autoLoad: true,
  });

  // Use toast notifications
  const { toasts, removeToast, updateToast, skinToasts } = useRainmeterToasts();

  // Check if Rainmeter is installed when component mounts
  useEffect(() => {
    checkRainmeterInstallation();
    loadInstalledSkinsFromStorage();
  }, []);

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await rainmeterSkinsAPI.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  // Load installed skins from localStorage
  const loadInstalledSkinsFromStorage = () => {
    const installedSkinIds = rainmeterStorage.getInstalledSkinIds();
    setInstalledSkins(installedSkinIds);
  };

  // Set up Electron API listeners
  useEffect(() => {
    if (typeof window.electronAPI !== "undefined") {
      // Download progress listener
      const downloadProgressListener = (
        _event: any,
        data: { skinId: string; progress: number }
      ) => {
        // Progress updates are handled by toast system
      };

      // Install progress listener
      const installProgressListener = (
        _event: any,
        data: { skinId: string; progress: number; message: string }
      ) => {
        // Progress updates are handled by toast system
      };

      // Toggle progress listener
      const toggleProgressListener = (
        _event: any,
        data: { skinId: string; message: string }
      ) => {
        // Progress updates are handled by toast system
      };

      // Add listeners
      window.electronAPI.on("skin-download-progress", downloadProgressListener);
      window.electronAPI.on("skin-install-progress", installProgressListener);
      window.electronAPI.on("skin-toggle-progress", toggleProgressListener);

      // Cleanup
      return () => {
        window.electronAPI.removeListener(
          "skin-download-progress",
          downloadProgressListener
        );
        window.electronAPI.removeListener(
          "skin-install-progress",
          installProgressListener
        );
        window.electronAPI.removeListener(
          "skin-toggle-progress",
          toggleProgressListener
        );
      };
    }
  }, []);

  // Function to check if Rainmeter is installed
  const checkRainmeterInstallation = async () => {
    setRainmeterStatus("checking");
    try {
      if (typeof window.electronAPI !== "undefined") {
        // Create a channel to receive response from the checkRainmeterInstalled handler
        const checkListener = (_event: any, result: any) => {
          setRainmeterStatus(result.installed ? "installed" : "not_installed");
        };

        window.electronAPI.on("rainmeter-check-result", checkListener);

        // Send request to check Rainmeter installation
        window.electronAPI.send("check-rainmeter-installation", {});

        // Return cleanup function to remove the listener
        return () => {
          window.electronAPI.removeListener(
            "rainmeter-check-result",
            checkListener
          );
        };
      } else {
        // Fallback for development without Electron
        console.warn("electronAPI not available, using mock detection");
        // Simulate a check (replace with actual implementation)
        setTimeout(() => {
          setRainmeterStatus("not_installed");
        }, 1000);
      }
    } catch (error) {
      console.error("Error checking Rainmeter installation:", error);
      setRainmeterStatus("not_installed");
    }
  };

  // Function to install Rainmeter via winget
  const installRainmeter = async () => {
    setInstallationState("installing");
    setInstallProgress(0);
    setErrorMessage(null);

    try {
      if (typeof window.electronAPI !== "undefined") {
        // Set up listeners for installation progress and results
        const progressListener = (_event: any, data: { progress: number }) => {
          setInstallProgress(data.progress);
        };

        const resultListener = (
          _event: any,
          result: { success: boolean; error?: string }
        ) => {
          if (result.success) {
            setInstallationState("success");
            setRainmeterStatus("installed");
          } else {
            setInstallationState("error");
            setErrorMessage(result.error || "Installation failed");
          }
        };

        window.electronAPI.on("rainmeter-install-progress", progressListener);
        window.electronAPI.on("rainmeter-install-result", resultListener);

        // Send request to install Rainmeter
        window.electronAPI.send("install-rainmeter", {});

        // Return cleanup function to remove listeners
        return () => {
          window.electronAPI.removeListener(
            "rainmeter-install-progress",
            progressListener
          );
          window.electronAPI.removeListener(
            "rainmeter-install-result",
            resultListener
          );
        };
      } else {
        // Fallback for development without Electron
        console.warn("electronAPI not available, using mock installation");
        // Simulate installation progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setInstallProgress(progress);

          if (progress >= 100) {
            clearInterval(interval);
            setInstallationState("success");
            setRainmeterStatus("installed");
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error installing Rainmeter:", error);
      setInstallationState("error");
      setErrorMessage("Failed to start installation process");
    }
  };

  // Function to retry installation
  const retryInstallation = () => {
    setInstallationState("idle");
    setErrorMessage(null);
    installRainmeter();
  };

  // Function to render installation status
  const renderInstallationStatus = () => {
    switch (installationState) {
      case "installing":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
              <span>Installing Rainmeter...</span>
            </div>
            <Progress value={installProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              This may take a few minutes. Please don&apos;t close the
              application.
            </p>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center space-x-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Installation successful! Rainmeter is now ready to use.</span>
          </div>
        );
      case "error":
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Installation Failed</AlertTitle>
            <AlertDescription>
              {errorMessage || "There was an error installing Rainmeter."}
              <Button
                variant="outline"
                size="sm"
                onClick={retryInstallation}
                className="mt-2"
              >
                Retry Installation
              </Button>
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  // Skin management handlers
  const handleSearch = async () => {
    await search({
      query: searchQuery || undefined,
      category: selectedCategory === "All" ? undefined : selectedCategory,
      sorting: sortBy,
    });
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    await search({
      query: searchQuery || undefined,
      category: category === "All" ? undefined : category,
      sorting: sortBy,
    });
  };

  const handleSortChange = async (sorting: string) => {
    const typedSorting = sorting as
      | "name"
      | "rating"
      | "downloads"
      | "last_updated"
      | "file_size";
    setSortBy(typedSorting);
    await search({
      query: searchQuery || undefined,
      category: selectedCategory === "All" ? undefined : selectedCategory,
      sorting: typedSorting,
    });
  };

  const handleSkinClick = (skin: RainmeterSkin) => {
    setSelectedSkin(skin);
    setIsModalOpen(true);
  };

  const handleDownload = async (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window.electronAPI === "undefined") {
      skinToasts.error("download", skin.name, "Electron API not available");
      return;
    }

    const toastId = skinToasts.downloading(skin.name);

    try {
      // Generate filename for the skin
      const filename = `${skin.name.replace(/[^a-zA-Z0-9]/g, "_")}.rmskin`;

      const result = await window.electronAPI.downloadRainmeterSkin(
        skin.download_url,
        filename,
        skin.id
      );

      if (result.success) {
        updateToast(toastId, {
          type: "success",
          message: `Downloaded ${skin.name}`,
          subMessage: result.alreadyExists
            ? "File already existed"
            : "Skin package saved",
          duration: 5000,
        });
      } else {
        updateToast(toastId, {
          type: "error",
          message: `Failed to download ${skin.name}`,
          subMessage: result.error,
          duration: 8000,
        });
      }
    } catch (error) {
      updateToast(toastId, {
        type: "error",
        message: `Failed to download ${skin.name}`,
        subMessage: error instanceof Error ? error.message : "Unknown error",
        duration: 8000,
      });
    }
  };

  const handleInstall = async (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window.electronAPI === "undefined") {
      skinToasts.error("install", skin.name, "Electron API not available");
      return;
    }

    // First download the skin if needed
    const filename = `${skin.name.replace(/[^a-zA-Z0-9]/g, "_")}.rmskin`;
    const downloadToastId = skinToasts.downloading(skin.name);

    try {
      // Download the skin
      const downloadResult = await window.electronAPI.downloadRainmeterSkin(
        skin.download_url,
        filename,
        skin.id
      );

      if (!downloadResult.success) {
        updateToast(downloadToastId, {
          type: "error",
          message: `Failed to download ${skin.name}`,
          subMessage: downloadResult.error,
          duration: 8000,
        });
        return;
      }

      // Update download toast to installing
      updateToast(downloadToastId, {
        type: "loading",
        message: `Installing ${skin.name}`,
        subMessage: "Setting up skin files...",
      });

      // Install the skin
      const installResult = await window.electronAPI.installRainmeterSkin(
        downloadResult.path,
        skin.id,
        skin.name
      );

      if (installResult.success) {
        // Add to local storage
        rainmeterStorage.addInstalledSkin({
          skinId: skin.id,
          isInstalled: true,
          isEnabled: false,
          installPath: installResult.path,
          version: skin.version,
        });

        // Update UI state
        setInstalledSkins((prev) => new Set([...prev, skin.id]));

        updateToast(downloadToastId, {
          type: "success",
          message: `Installed ${skin.name}`,
          subMessage: "Skin is ready to use",
          duration: 5000,
        });
      } else {
        updateToast(downloadToastId, {
          type: "error",
          message: `Failed to install ${skin.name}`,
          subMessage: installResult.error,
          duration: 8000,
        });
      }
    } catch (error) {
      updateToast(downloadToastId, {
        type: "error",
        message: `Failed to install ${skin.name}`,
        subMessage: error instanceof Error ? error.message : "Unknown error",
        duration: 8000,
      });
    }
  };

  const handlePreview = (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSkin(skin);
    setIsModalOpen(true);
  };

  const handleModalDownload = (skin: RainmeterSkin) => {
    // Create a mock event for the download handler
    const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
    handleDownload(skin, mockEvent);
  };

  const handleModalInstall = (skin: RainmeterSkin) => {
    // Create a mock event for the install handler
    const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
    handleInstall(skin, mockEvent);
  };

  const handleModalEnable = async (skin: RainmeterSkin) => {
    if (typeof window.electronAPI === "undefined") {
      skinToasts.error("enable", skin.name, "Electron API not available");
      return;
    }

    const toastId = skinToasts.enabling(skin.name);

    try {
      const isCurrentlyEnabled =
        installedSkins.has(skin.id) &&
        rainmeterStorage.getSkinStatus(skin.id)?.isEnabled;

      const result = await window.electronAPI.toggleRainmeterSkin(
        skin.id,
        skin.name,
        "", // skin path - would need to be retrieved from storage
        isCurrentlyEnabled
      );

      if (result.success) {
        // Update local storage
        rainmeterStorage.updateSkinEnabledStatus(skin.id, !isCurrentlyEnabled);

        updateToast(toastId, {
          type: "success",
          message: `${!isCurrentlyEnabled ? "Enabled" : "Disabled"} ${
            skin.name
          }`,
          subMessage: !isCurrentlyEnabled
            ? "Skin is now active"
            : "Skin has been deactivated",
          duration: 5000,
        });
      } else {
        updateToast(toastId, {
          type: "error",
          message: `Failed to toggle ${skin.name}`,
          subMessage: error instanceof Error ? error.message : "Unknown error",
          duration: 8000,
        });
      }
    } catch (error) {
      updateToast(toastId, {
        type: "error",
        message: `Failed to toggle ${skin.name}`,
        subMessage: error instanceof Error ? error.message : "Unknown error",
        duration: 8000,
      });
    }
  };

  const handleModalConfigure = (skin: RainmeterSkin) => {
    setSelectedSkin(skin);
    setIsModalOpen(false);
    setIsConfigModalOpen(true);
  };

  const handleConfigSave = (configuration: any) => {
    rainmeterStorage.saveSkinConfiguration(configuration);
    skinToasts.configuring(configuration.skinId);
    setIsConfigModalOpen(false);
  };

  const handleClearCache = () => {
    clearSkinsCache();
  };

  return (
    <div className="space-y-6">
      {/* Rainmeter Installation Status */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {rainmeterStatus === "checking" ? (
              <>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Checking Rainmeter Installation...</span>
              </>
            ) : rainmeterStatus === "installed" ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Rainmeter Detected</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Rainmeter Not Detected</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {rainmeterStatus === "checking"
              ? "Checking if Rainmeter is installed on your system..."
              : rainmeterStatus === "installed"
              ? "Rainmeter is installed and ready to use. Browse and install skins below."
              : "Rainmeter is not installed on your system. Click the button below to install it automatically using winget."}
          </CardDescription>
        </CardHeader>

        {rainmeterStatus === "not_installed" &&
          installationState === "idle" && (
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={installRainmeter}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install via winget
                </Button>
                <div className="text-sm text-muted-foreground">
                  Command:{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    winget install Rainmeter
                  </code>
                </div>
              </div>
            </CardContent>
          )}

        {installationState !== "idle" && (
          <CardContent>{renderInstallationStatus()}</CardContent>
        )}
      </Card>

      {/* Skin Management Section */}
      {rainmeterStatus === "installed" && (
        <div className="space-y-6">
          {/* Header */}
          <SkinHeader
            isLoading={isLoading}
            error={skinsError}
            totalCount={totalCount}
            isFromCache={isFromCache}
            cacheAge={cacheAge}
            viewMode={viewMode}
            showCacheStats={showCacheStats}
            onRefresh={refresh}
            onToggleCacheStats={() => setShowCacheStats(!showCacheStats)}
            onViewModeChange={setViewMode}
          />

          {/* Search and Filters */}
          <SkinSearchFilters
            searchQuery={searchQuery}
            sortBy={sortBy}
            isLoading={isLoading}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onSortChange={handleSortChange}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
                disabled={isLoading}
                className={
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                    : ""
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {skins.length} of {totalCount.toLocaleString()} skins
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>

          {/* Skins Grid */}
          <SkinGrid
            skins={skins}
            viewMode={viewMode}
            installedSkins={installedSkins}
            onSkinClick={handleSkinClick}
            onDownload={handleDownload}
            onInstall={handleInstall}
            onPreview={handlePreview}
          />

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-8"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Skins"
                )}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && skins.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-muted-foreground">Loading skins...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && skins.length === 0 && !skinsError && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No skins found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse different
                categories.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  handleSearch();
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Error State */}
          {skinsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Skins</AlertTitle>
              <AlertDescription>
                {skinsError.message}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Skin Preview Modal */}
      <SkinModal
        skin={selectedSkin}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isInstalled={selectedSkin ? installedSkins.has(selectedSkin.id) : false}
        onDownload={handleModalDownload}
        onInstall={handleModalInstall}
        onEnable={handleModalEnable}
        onConfigure={handleModalConfigure}
      />

      {/* Skin Configuration Modal */}
      <SkinConfigModal
        skin={selectedSkin}
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleConfigSave}
        currentConfig={
          selectedSkin
            ? rainmeterStorage.getSkinConfiguration(selectedSkin.id)
            : null
        }
      />

      {/* Toast Notifications */}
      <RainmeterToastNotifications
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
}
