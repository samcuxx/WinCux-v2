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
import { rainmeterSkinsAPI } from "@/lib/services/rainmeter-skins-api";
import { SkinHeader } from "@/components/rainmeter/skin-header";
import { SkinSearchFilters } from "@/components/rainmeter/skin-search-filters";
import { SkinGrid } from "@/components/rainmeter/skin-grid";
import { SkinModal } from "@/components/ui/skin-modal";
import { useRainmeterToasts } from "@/hooks/use-rainmeter-toasts";
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
  const [installedSkins, setInstalledSkins] = useState<Set<string>>(new Set());
  const [downloadedSkins, setDownloadedSkins] = useState<Set<string>>(
    new Set()
  );
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [showCacheStats, setShowCacheStats] = useState(false);
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(
    new Set()
  );
  const [installingItems, setInstallingItems] = useState<Set<string>>(
    new Set()
  );

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
  const { toasts, skinToasts, updateToast, removeToast, addToast } =
    useRainmeterToasts();

  // Check if Rainmeter is installed when component mounts
  useEffect(() => {
    checkRainmeterInstallation();
  }, []);

  // Load installed skins when Rainmeter is detected
  useEffect(() => {
    if (rainmeterStatus === "installed") {
      loadInstalledSkins();
    }
  }, [rainmeterStatus, skins]);

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

  // Live search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, sortBy]);

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

  // Function to load installed skins from Rainmeter
  const loadInstalledSkins = async () => {
    try {
      if (typeof window.electronAPI !== "undefined") {
        // Load installed skins
        const installedResult =
          await window.electronAPI.getInstalledRainmeterSkins();

        if (installedResult.success && installedResult.skins) {
          console.log(
            `Found ${installedResult.skins.length} installed skins:`,
            installedResult.skins.map((s) => ({
              name: s.name,
              skinId: s.skinId,
            }))
          );

          // Create a mapping of installed skins to our CSV skin IDs
          const installedIds = new Set<string>();

          // For each installed skin, try to match it with our CSV data
          installedResult.skins.forEach((installedSkin: any) => {
            // Check if any of our loaded skins match this installed skin
            const matchingSkin = skins.find((csvSkin) => {
              // Try multiple matching strategies
              return (
                // Exact ID match
                csvSkin.id === installedSkin.skinId ||
                // Exact name match
                csvSkin.name.toLowerCase() ===
                  installedSkin.name.toLowerCase() ||
                // Partial name match
                csvSkin.name
                  .toLowerCase()
                  .includes(installedSkin.name.toLowerCase()) ||
                installedSkin.name
                  .toLowerCase()
                  .includes(csvSkin.name.toLowerCase()) ||
                // Generated ID match
                csvSkin.name.toLowerCase().replace(/\s+/g, "-") ===
                  installedSkin.skinId
              );
            });

            if (matchingSkin) {
              installedIds.add(matchingSkin.id);
              console.log(
                `Matched installed skin "${installedSkin.name}" to CSV skin "${matchingSkin.name}" (ID: ${matchingSkin.id})`
              );
            } else {
              console.log(
                `No CSV match found for installed skin: "${installedSkin.name}" (ID: ${installedSkin.skinId})`
              );
            }
          });

          setInstalledSkins(installedIds);
          console.log(
            `Mapped ${installedIds.size} installed skins to CSV data`
          );
        }

        // Load downloaded skins (.rmskin files)
        await loadDownloadedSkins();
      }
    } catch (error) {
      console.error("Failed to load installed skins:", error);
    }
  };

  // Function to detect downloaded .rmskin files
  const loadDownloadedSkins = async () => {
    try {
      if (typeof window.electronAPI !== "undefined") {
        // We need to implement a new API to list downloaded .rmskin files
        // For now, we'll track downloads in localStorage as a fallback
        const downloadedSkinsData = localStorage.getItem(
          "rainmeter-downloaded-skins"
        );
        if (downloadedSkinsData) {
          const downloadedIds = JSON.parse(downloadedSkinsData);
          setDownloadedSkins(new Set(downloadedIds));
          console.log(
            `Loaded ${downloadedIds.length} downloaded skins from localStorage`
          );
        }
      }
    } catch (error) {
      console.error("Failed to load downloaded skins:", error);
    }
  };

  // Function to save downloaded skins to localStorage
  const saveDownloadedSkin = (skinId: string) => {
    try {
      const downloadedSkinsData = localStorage.getItem(
        "rainmeter-downloaded-skins"
      );
      const downloadedIds = downloadedSkinsData
        ? JSON.parse(downloadedSkinsData)
        : [];

      if (!downloadedIds.includes(skinId)) {
        downloadedIds.push(skinId);
        localStorage.setItem(
          "rainmeter-downloaded-skins",
          JSON.stringify(downloadedIds)
        );
        setDownloadedSkins((prev) => new Set(Array.from(prev).concat(skinId)));
      }
    } catch (error) {
      console.error("Failed to save downloaded skin:", error);
    }
  };

  // Function to remove downloaded skin from localStorage
  const removeDownloadedSkin = (skinId: string) => {
    try {
      const downloadedSkinsData = localStorage.getItem(
        "rainmeter-downloaded-skins"
      );
      if (downloadedSkinsData) {
        const downloadedIds = JSON.parse(downloadedSkinsData);
        const updatedIds = downloadedIds.filter((id: string) => id !== skinId);
        localStorage.setItem(
          "rainmeter-downloaded-skins",
          JSON.stringify(updatedIds)
        );

        setDownloadedSkins((prev) => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(skinId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to remove downloaded skin:", error);
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
    // Live search useEffect will handle the search automatically
  };

  const handleSortChange = async (sorting: string) => {
    const typedSorting = sorting as
      | "name"
      | "rating"
      | "downloads"
      | "last_updated"
      | "file_size";
    setSortBy(typedSorting);
    // Live search useEffect will handle the search automatically
  };

  const handleSkinClick = (skin: RainmeterSkin) => {
    setSelectedSkin(skin);
    setIsModalOpen(true);
  };

  const handleDownload = async (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();

    if (downloadingItems.has(skin.id)) return;

    try {
      setDownloadingItems((prev) => new Set(Array.from(prev).concat(skin.id)));
      const toastId = skinToasts.downloading(skin.name);

      if (typeof window.electronAPI !== "undefined") {
        const filename = `${skin.name.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_Rainmeter_Skin.rmskin`;
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
              ? "File already exists"
              : "Download completed",
            duration: 3000,
          });

          // Mark as downloaded
          setDownloadedSkins(
            (prev) => new Set(Array.from(prev).concat(skin.id))
          );
          saveDownloadedSkin(skin.id);
        } else {
          updateToast(toastId, {
            type: "error",
            message: `Failed to download ${skin.name}`,
            subMessage: result.error,
            duration: 8000,
          });
        }
      }
    } catch (error) {
      skinToasts.error(
        "download",
        skin.name,
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setDownloadingItems((prev) => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(skin.id);
        return newSet;
      });
    }
  };

  const handleInstall = async (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();

    if (installingItems.has(skin.id)) return;

    try {
      setInstallingItems((prev) => new Set(Array.from(prev).concat(skin.id)));

      // First download if not already downloaded
      const filename = `${skin.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Rainmeter_Skin.rmskin`;
      const toastId = skinToasts.installing(skin.name);

      if (typeof window.electronAPI !== "undefined") {
        // Download first
        const downloadResult = await window.electronAPI.downloadRainmeterSkin(
          skin.download_url,
          filename,
          skin.id
        );

        if (!downloadResult.success) {
          updateToast(toastId, {
            type: "error",
            message: `Failed to download ${skin.name}`,
            subMessage: downloadResult.error,
            duration: 8000,
          });
          return;
        }

        // Then install
        const installResult = await window.electronAPI.installRainmeterSkin(
          downloadResult.path || "",
          skin.id,
          skin.name
        );

        if (installResult.success) {
          updateToast(toastId, {
            type: "success",
            message: `Installed ${skin.name}`,
            subMessage: "Skin is ready to use",
            duration: 3000,
          });

          // Mark as downloaded and installed
          setDownloadedSkins(
            (prev) => new Set(Array.from(prev).concat(skin.id))
          );
          setInstalledSkins(
            (prev) => new Set(Array.from(prev).concat(skin.id))
          );
          saveDownloadedSkin(skin.id);
        } else {
          updateToast(toastId, {
            type: "error",
            message: `Failed to install ${skin.name}`,
            subMessage: installResult.error,
            duration: 8000,
          });
        }
      }
    } catch (error) {
      skinToasts.error(
        "install",
        skin.name,
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setInstallingItems((prev) => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(skin.id);
        return newSet;
      });
    }
  };

  const handlePreview = (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSkin(skin);
    setIsModalOpen(true);
  };

  const handleModalDownload = async (skin: RainmeterSkin) => {
    // Create a mock event object
    const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
    await handleDownload(skin, mockEvent);
  };

  const handleModalInstall = async (skin: RainmeterSkin) => {
    // Create a mock event object
    const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
    await handleInstall(skin, mockEvent);
  };

  const handleEnable = async (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const toastId = skinToasts.enabling(skin.name);

      if (typeof window.electronAPI !== "undefined") {
        const result = await window.electronAPI.toggleRainmeterSkin(
          skin.id,
          skin.name,
          "",
          false // enable the skin
        );

        if (result.success) {
          updateToast(toastId, {
            type: "success",
            message: `Enabled ${skin.name}`,
            subMessage: "Skin is now active on your desktop",
            duration: 3000,
          });
        } else {
          updateToast(toastId, {
            type: "error",
            message: `Failed to enable ${skin.name}`,
            subMessage: result.error,
            duration: 8000,
          });
        }
      }
    } catch (error) {
      skinToasts.error(
        "enable",
        skin.name,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleConfigure = async (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const toastId = skinToasts.configuring(skin.name);

      if (typeof window.electronAPI !== "undefined") {
        const result = await window.electronAPI.configureRainmeterSkin(
          skin.id,
          skin.name,
          ""
        );

        if (result.success) {
          updateToast(toastId, {
            type: "success",
            message: `Configuration opened for ${skin.name}`,
            subMessage: "Rainmeter settings dialog launched",
            duration: 3000,
          });
        } else {
          updateToast(toastId, {
            type: "error",
            message: `Failed to configure ${skin.name}`,
            subMessage: result.error,
            duration: 8000,
          });
        }
      }
    } catch (error) {
      skinToasts.error(
        "configure",
        skin.name,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleUninstall = async (skin: RainmeterSkin, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const toastId = addToast(`Uninstalling ${skin.name}`, {
        type: "loading",
        subMessage: "Removing skin files...",
      });

      if (typeof window.electronAPI !== "undefined") {
        // First, get the list of installed skins to find the correct one
        const installedResult =
          await window.electronAPI.getInstalledRainmeterSkins();

        if (installedResult.success && installedResult.skins) {
          console.log(`Looking for skin "${skin.name}" with ID "${skin.id}"`);
          console.log(
            "Available installed skins:",
            installedResult.skins.map((s) => ({
              name: s.name,
              skinId: s.skinId,
              path: s.path,
            }))
          );

          // Try multiple matching strategies
          let installedSkin = null;

          // 1. Try exact skin ID match
          installedSkin = installedResult.skins.find(
            (s: any) => s.skinId === skin.id
          );

          // 2. Try exact name match
          if (!installedSkin) {
            installedSkin = installedResult.skins.find(
              (s: any) => s.name.toLowerCase() === skin.name.toLowerCase()
            );
          }

          // 3. Try partial name match
          if (!installedSkin) {
            installedSkin = installedResult.skins.find(
              (s: any) =>
                s.name.toLowerCase().includes(skin.name.toLowerCase()) ||
                skin.name.toLowerCase().includes(s.name.toLowerCase())
            );
          }

          // 4. Try generated ID matching
          if (!installedSkin) {
            const normalizedSkinName = skin.name
              .toLowerCase()
              .replace(/\s+/g, "-");
            installedSkin = installedResult.skins.find(
              (s: any) => s.skinId === normalizedSkinName
            );
          }

          if (installedSkin) {
            console.log(`Found matching skin:`, installedSkin);

            const result = await window.electronAPI.uninstallRainmeterSkin(
              installedSkin.skinId,
              installedSkin.name,
              installedSkin.path || ""
            );

            if (result.success) {
              updateToast(toastId, {
                type: "success",
                message: `Uninstalled ${skin.name}`,
                subMessage: "Skin has been removed from your system",
                duration: 3000,
              });

              // Remove from installed skins
              setInstalledSkins((prev) => {
                const newSet = new Set(Array.from(prev));
                newSet.delete(skin.id);
                return newSet;
              });

              // Reload installed skins to ensure consistency
              await loadInstalledSkins();
            } else {
              updateToast(toastId, {
                type: "error",
                message: `Failed to uninstall ${skin.name}`,
                subMessage: result.error || "Unknown error",
                duration: 8000,
              });
            }
          } else {
            // Try fallback uninstall with just the skin name
            console.log(
              `No exact match found, trying fallback uninstall for: ${skin.name}`
            );

            const result = await window.electronAPI.uninstallRainmeterSkin(
              skin.id,
              skin.name,
              "" // Empty path - let the backend find it
            );

            if (result.success) {
              updateToast(toastId, {
                type: "success",
                message: `Uninstalled ${skin.name}`,
                subMessage: "Skin has been removed from your system",
                duration: 3000,
              });

              // Remove from installed skins
              setInstalledSkins((prev) => {
                const newSet = new Set(Array.from(prev));
                newSet.delete(skin.id);
                return newSet;
              });

              // Reload installed skins to ensure consistency
              await loadInstalledSkins();
            } else {
              updateToast(toastId, {
                type: "error",
                message: `Cannot find installed skin "${skin.name}"`,
                subMessage:
                  "The skin may not be properly installed or may have been moved",
                duration: 8000,
              });
            }
          }
        } else {
          updateToast(toastId, {
            type: "error",
            message: `Failed to get installed skins list`,
            subMessage: "Cannot proceed with uninstall",
            duration: 8000,
          });
        }
      }
    } catch (error) {
      console.error("Uninstall error:", error);
      skinToasts.error(
        "uninstall",
        skin.name,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleClearCache = () => {
    clearSkinsCache();
  };

  // Modal handlers that match the expected signatures
  const handleModalConfigure = async (skin: RainmeterSkin) => {
    // Create a mock event object
    const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
    await handleConfigure(skin, mockEvent);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <RainmeterToastNotifications
        toasts={toasts}
        onRemoveToast={removeToast}
      />

      {/* Rainmeter Installation Status - Only show if not installed */}
      {rainmeterStatus === "not_installed" && (
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Rainmeter Not Detected</span>
            </CardTitle>
            <CardDescription>
              Rainmeter is not installed on your system. Click the button below
              to install it automatically using winget.
            </CardDescription>
          </CardHeader>

          {installationState === "idle" && (
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
      )}

      {/* Skin Management Section */}
      {rainmeterStatus === "installed" && (
        <div className="space-y-6">
          {/* Header with Status Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rainmeter Skins
              </h1>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Active
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground">
            Discover and install beautiful Rainmeter skins for your desktop
          </p>

          {/* Search and Sort on Same Line */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search skins by name, developer, tags, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                disabled={isLoading}
                aria-label="Sort skins by"
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Rating</option>
                <option value="downloads">Downloads</option>
                <option value="name">Name</option>
                <option value="last_updated">Updated</option>
                <option value="file_size">Size</option>
              </select>
            </div>
          </div>

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
            downloadedSkins={downloadedSkins}
            onSkinClick={handleSkinClick}
            onDownload={handleDownload}
            onInstall={handleInstall}
            onPreview={handlePreview}
            onConfigure={handleConfigure}
            onUninstall={handleUninstall}
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
        isDownloaded={
          selectedSkin ? downloadedSkins.has(selectedSkin.id) : false
        }
        onDownload={handleModalDownload}
        onInstall={handleModalInstall}
        onEnable={() => {}}
        onConfigure={handleModalConfigure}
      />
    </div>
  );
}
