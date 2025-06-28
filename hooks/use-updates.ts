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
  errorCode?: string;
  updateInfo?: any;
}

interface ReminderState {
  shouldShow: boolean;
  nextReminderTime: number;
}

// Keep a global reference to the reminder state to persist across navigation
let globalReminderState: ReminderState = {
  shouldShow: true,
  nextReminderTime: 0,
};

export function useUpdates() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    status: "idle",
  });
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [reminderState, setReminderState] =
    useState<ReminderState>(globalReminderState);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize update listeners only on client
  useEffect(() => {
    if (!isClient || typeof window === "undefined") {
      return;
    }

    const updateAPI = (window as any).updateAPI;
    if (!updateAPI) {
      console.warn("Update API not available");
      return;
    }

    // Get initial reminder state if the API is available
    if (updateAPI.getReminderState) {
      updateAPI
        .getReminderState()
        .then((state: ReminderState) => {
          globalReminderState = state;
          setReminderState(state);
        })
        .catch((err: Error) => {
          console.warn("Failed to get reminder state:", err);
          // Keep default state if there's an error
        });
    }

    // Get initial update info
    updateAPI
      .getUpdateInfo()
      .then((info: UpdateInfo) => {
        setUpdateInfo(info);

        // If an update was already downloaded before this component mounted
        if (info.updateDownloaded) {
          setUpdateStatus({
            status: "downloaded",
            updateInfo: info.updateInfo,
          });
        } else if (info.updateAvailable && globalReminderState.shouldShow) {
          setUpdateStatus({
            status: "available",
            updateInfo: info.updateInfo,
          });
        }
      })
      .catch((err: Error) => {
        console.error("Failed to get update info:", err);
      });

    // Listen for update status changes
    const statusHandler = (data: any) => {
      setUpdateStatus((prev) => ({ ...prev, status: data.status }));
    };

    // Listen for update available
    const availableHandler = (data: any) => {
      if (globalReminderState.shouldShow) {
        setUpdateStatus((prev) => ({
          ...prev,
          status: "available",
          updateInfo: data,
        }));
        setUpdateInfo((prev) =>
          prev ? { ...prev, updateAvailable: true, updateInfo: data } : null
        );
      }
    };

    // Listen for download progress
    const progressHandler = (data: UpdateProgress) => {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "downloading",
        progress: data,
      }));
    };

    // Listen for update downloaded
    const downloadedHandler = (data: any) => {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "downloaded",
        updateInfo: data,
      }));
      setUpdateInfo((prev) =>
        prev ? { ...prev, updateDownloaded: true } : null
      );
    };

    // Listen for update errors
    const errorHandler = (data: { error: string; code?: string }) => {
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: data.error,
        errorCode: data.code,
      }));
    };

    // Register event handlers
    updateAPI.onUpdateStatus(statusHandler);
    updateAPI.onUpdateAvailable(availableHandler);
    updateAPI.onUpdateProgress(progressHandler);
    updateAPI.onUpdateDownloaded(downloadedHandler);
    updateAPI.onUpdateError(errorHandler);

    // Cleanup listeners on unmount
    return () => {
      if (updateAPI && updateAPI.removeAllListeners) {
        updateAPI.removeAllListeners("update-status");
        updateAPI.removeAllListeners("update-available");
        updateAPI.removeAllListeners("update-progress");
        updateAPI.removeAllListeners("update-downloaded");
        updateAPI.removeAllListeners("update-error");
      }
    };
  }, [isClient]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!isClient || typeof window === "undefined") {
      return { success: false, error: "Client-side only" };
    }

    const updateAPI = (window as any).updateAPI;
    if (!updateAPI) {
      console.warn("Update API not available");
      return { success: false, error: "Update API not available" };
    }

    setUpdateStatus((prev) => ({ ...prev, status: "checking" }));
    try {
      const result = await updateAPI.checkForUpdates();
      if (!result.success) {
        setUpdateStatus((prev) => ({
          ...prev,
          status: "error",
          error: result.error,
          errorCode: result.code,
        }));
      }
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [isClient]);

  // Download update
  const downloadUpdate = useCallback(async () => {
    if (!isClient || typeof window === "undefined") {
      return { success: false, error: "Client-side only" };
    }

    const updateAPI = (window as any).updateAPI;
    if (!updateAPI) {
      return { success: false, error: "Update API not available" };
    }

    setUpdateStatus((prev) => ({ ...prev, status: "downloading" }));
    try {
      const result = await updateAPI.downloadUpdate();
      if (!result.success) {
        setUpdateStatus((prev) => ({
          ...prev,
          status: "error",
          error: result.error,
          errorCode: result.code,
        }));
      }
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [isClient]);

  // Install update
  const installUpdate = useCallback(async () => {
    if (!isClient || typeof window === "undefined") {
      return { success: false, error: "Client-side only" };
    }

    const updateAPI = (window as any).updateAPI;
    if (!updateAPI) {
      return { success: false, error: "Update API not available" };
    }

    try {
      return await updateAPI.installUpdate();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setUpdateStatus((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [isClient]);

  const remindLater = useCallback(async () => {
    if (!isClient || typeof window === "undefined") {
      return { success: false, error: "Client-side only" };
    }

    const updateAPI = (window as any).updateAPI;
    if (!updateAPI || !updateAPI.remindLater) {
      return {
        success: false,
        error: "Remind later functionality not available",
      };
    }

    try {
      const result = await updateAPI.remindLater();
      if (result.success) {
        // If getReminderState is not available, set a default state
        if (updateAPI.getReminderState) {
          const newState = await updateAPI.getReminderState();
          globalReminderState = newState;
          setReminderState(newState);
        } else {
          const newState = {
            shouldShow: false,
            nextReminderTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          };
          globalReminderState = newState;
          setReminderState(newState);
        }
        setUpdateStatus((prev) => ({ ...prev, status: "idle" }));
      }
      return result;
    } catch (error) {
      console.error("Failed to set remind later:", error);
      return { success: false, error: "Failed to set reminder" };
    }
  }, [isClient]);

  const resetReminder = useCallback(async () => {
    if (!isClient || typeof window === "undefined") {
      return { success: false, error: "Client-side only" };
    }

    const updateAPI = (window as any).updateAPI;
    if (!updateAPI || !updateAPI.resetReminder) {
      return {
        success: false,
        error: "Reset reminder functionality not available",
      };
    }

    try {
      const result = await updateAPI.resetReminder();
      if (result.success) {
        if (updateAPI.getReminderState) {
          const newState = await updateAPI.getReminderState();
          globalReminderState = newState;
          setReminderState(newState);
        } else {
          const newState = {
            shouldShow: true,
            nextReminderTime: 0,
          };
          globalReminderState = newState;
          setReminderState(newState);
        }
      }
      return result;
    } catch (error) {
      console.error("Failed to reset reminder:", error);
      return { success: false, error: "Failed to reset reminder" };
    }
  }, [isClient]);

  return {
    updateStatus,
    updateInfo,
    reminderState,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    remindLater,
    resetReminder,
    isClient,
  };
}
