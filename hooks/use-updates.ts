import { useState, useEffect, useCallback } from "react";

interface UpdateInfo {
  currentVersion: string;
  updateAvailable: boolean;
  updateDownloaded: boolean;
  updateInfo: any;
}

interface UpdateProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

interface UpdateStatus {
  status:
    | "idle"
    | "checking"
    | "available"
    | "downloading"
    | "downloaded"
    | "error"
    | "not-available";
  progress?: UpdateProgress;
  error?: string;
  updateInfo?: any;
}

export function useUpdates() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    status: "idle",
  });
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize update listeners only on client
  useEffect(() => {
    if (!isClient || typeof window === "undefined" || !(window as any).updateAPI) {
      return;
    }

    const updateAPI = (window as any).updateAPI;

    // Get initial update info
    updateAPI.getUpdateInfo().then((info: UpdateInfo) => {
      setUpdateInfo(info);
    }).catch(() => {
      // Ignore errors during initialization
    });

    // Listen for update status changes
    updateAPI.onUpdateStatus((data: any) => {
      setUpdateStatus((prev) => ({ ...prev, status: data.status }));
    });

    // Listen for update available
    updateAPI.onUpdateAvailable((data: any) => {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "available",
        updateInfo: data,
      }));
      setUpdateInfo((prev) =>
        prev ? { ...prev, updateAvailable: true, updateInfo: data } : null
      );
    });

    // Listen for download progress
    updateAPI.onUpdateProgress((data: UpdateProgress) => {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "downloading",
        progress: data,
      }));
    });

    // Listen for update downloaded
    updateAPI.onUpdateDownloaded((data: any) => {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "downloaded",
        updateInfo: data,
      }));
      setUpdateInfo((prev) =>
        prev ? { ...prev, updateDownloaded: true } : null
      );
    });

    // Listen for update errors
    updateAPI.onUpdateError((data: { error: string }) => {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: data.error,
      }));
    });

    // Cleanup listeners on unmount
    return () => {
      updateAPI.removeAllListeners("update-status");
      updateAPI.removeAllListeners("update-available");
      updateAPI.removeAllListeners("update-progress");
      updateAPI.removeAllListeners("update-downloaded");
      updateAPI.removeAllListeners("update-error");
    };
  }, [isClient]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!isClient || typeof window === "undefined" || !(window as any).updateAPI) {
      return;
    }
    
    setUpdateStatus((prev) => ({ ...prev, status: "checking" }));
    try {
      const result = await (window as any).updateAPI.checkForUpdates();
      if (!result.success) {
        setUpdateStatus((prev) => ({
          ...prev,
          status: "error",
          error: result.error,
        }));
      }
    } catch (error) {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [isClient]);

  // Download update
  const downloadUpdate = useCallback(async () => {
    if (!isClient || typeof window === "undefined" || !(window as any).updateAPI) {
      return;
    }
    
    setUpdateStatus((prev) => ({ ...prev, status: "downloading" }));
    try {
      const result = await (window as any).updateAPI.downloadUpdate();
      if (!result.success) {
        setUpdateStatus((prev) => ({
          ...prev,
          status: "error",
          error: result.error,
        }));
      }
    } catch (error) {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [isClient]);

  // Install update
  const installUpdate = useCallback(async () => {
    if (!isClient || typeof window === "undefined" || !(window as any).updateAPI) {
      return;
    }
    
    try {
      await (window as any).updateAPI.installUpdate();
    } catch (error) {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [isClient]);

  return {
    updateStatus,
    updateInfo,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    isClient
  };
}
