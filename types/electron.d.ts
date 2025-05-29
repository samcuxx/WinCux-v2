export interface ElectronAPI {
  // General IPC communication
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
  removeListener: (
    channel: string,
    callback: (event: any, ...args: any[]) => void
  ) => void;
  send: (channel: string, args: any) => void;

  // Window controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;

  // Wallpaper functionality
  downloadWallpaper: (
    url: string,
    filename: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>;
  setWallpaper: (
    url: string,
    filename: string
  ) => Promise<{ success: boolean; path?: string; error?: string }>;
  checkWallpaperExists: (
    filename: string
  ) => Promise<{ exists: boolean; path?: string | null; error?: string }>;

  // System utilities
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
