import { useState, useCallback } from "react";

interface Toast {
  id: string;
  type: "success" | "error" | "loading" | "info";
  message: string;
  subMessage?: string;
  duration?: number;
}

export interface ToastOptions {
  type?: "success" | "error" | "loading" | "info";
  subMessage?: string;
  duration?: number;
}

export function useRainmeterToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const toast: Toast = {
        id,
        type: options.type || "info",
        message,
        subMessage: options.subMessage,
        duration: options.duration || (options.type === "loading" ? 0 : 5000),
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove non-loading toasts
      if (toast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = useCallback(
    (id: string, options: Partial<ToastOptions> & { message?: string }) => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                message: options.message || toast.message,
                type: options.type || toast.type,
                subMessage:
                  options.subMessage !== undefined
                    ? options.subMessage
                    : toast.subMessage,
                duration:
                  options.duration !== undefined
                    ? options.duration
                    : toast.duration,
              }
            : toast
        )
      );

      // If duration is set and not loading, auto-remove
      if (
        options.duration &&
        options.duration > 0 &&
        options.type !== "loading"
      ) {
        setTimeout(() => {
          removeToast(id);
        }, options.duration);
      }
    },
    []
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for specific skin operations
  const skinToasts = {
    downloading: (skinName: string) =>
      addToast(`Downloading ${skinName}`, {
        type: "loading",
        subMessage: "Fetching skin package...",
      }),

    downloaded: (skinName: string) =>
      addToast(`Downloaded ${skinName}`, {
        type: "success",
        subMessage: "Skin package saved to downloads",
      }),

    installing: (skinName: string) =>
      addToast(`Installing ${skinName}`, {
        type: "loading",
        subMessage: "Setting up skin files...",
      }),

    installed: (skinName: string) =>
      addToast(`Installed ${skinName}`, {
        type: "success",
        subMessage: "Skin is ready to use",
      }),

    enabling: (skinName: string) =>
      addToast(`Enabling ${skinName}`, {
        type: "loading",
        subMessage: "Activating skin...",
      }),

    enabled: (skinName: string) =>
      addToast(`Enabled ${skinName}`, {
        type: "success",
        subMessage: "Skin is now active on your desktop",
      }),

    disabling: (skinName: string) =>
      addToast(`Disabling ${skinName}`, {
        type: "loading",
        subMessage: "Deactivating skin...",
      }),

    disabled: (skinName: string) =>
      addToast(`Disabled ${skinName}`, {
        type: "success",
        subMessage: "Skin has been deactivated",
      }),

    configuring: (skinName: string) =>
      addToast(`Configuring ${skinName}`, {
        type: "loading",
        subMessage: "Opening configuration...",
      }),

    error: (operation: string, skinName: string, error: string) =>
      addToast(`Failed to ${operation} ${skinName}`, {
        type: "error",
        subMessage: error,
        duration: 8000,
      }),

    refreshing: () =>
      addToast("Refreshing skin database", {
        type: "loading",
        subMessage: "Fetching latest skin data...",
      }),

    refreshed: (count: number) =>
      addToast("Database refreshed", {
        type: "success",
        subMessage: `${count} skins loaded`,
      }),
  };

  return {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearAllToasts,
    skinToasts,
  };
}
