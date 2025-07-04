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
  getLocalWallpaper: (filename: string) => Promise<{
    success: boolean;
    dataUrl?: string;
    path?: string;
    size?: number;
    error?: string;
  }>;
  listLocalWallpapers: () => Promise<{
    success: boolean;
    wallpapers: any[];
    error?: string;
  }>;
  getLocalWallpaperThumbnail: (filename: string) => Promise<{
    success: boolean;
    thumbnailUrl?: string;
    path?: string;
    size?: number;
    error?: string;
    fromCache?: boolean;
    fallback?: boolean;
  }>;
  deleteLocalWallpaper: (filename: string) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }>;
  openWallpapersFolder: () => Promise<{
    success: boolean;
    path?: string;
    error?: string;
  }>;

  // Rainmeter Skin Management
  downloadRainmeterSkin: (
    url: string,
    filename: string,
    skinId: string
  ) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
    skinId: string;
    alreadyExists?: boolean;
  }>;

  installRainmeterSkin: (
    skinPath: string,
    skinId: string,
    skinName: string
  ) => Promise<{
    success: boolean;
    path?: string;
    error?: string;
    skinId: string;
    message?: string;
  }>;

  toggleRainmeterSkin: (
    skinId: string,
    skinName: string,
    skinPath: string,
    isEnabled: boolean
  ) => Promise<{
    success: boolean;
    isEnabled?: boolean;
    error?: string;
    skinId: string;
    message?: string;
  }>;

  configureRainmeterSkin: (
    skinId: string,
    skinName: string,
    skinPath: string
  ) => Promise<{
    success: boolean;
    error?: string;
    skinId: string;
    message?: string;
  }>;

  getInstalledRainmeterSkins: () => Promise<{
    success: boolean;
    error?: string;
    skins: Array<{
      skinId: string;
      name: string;
      path: string;
      installedAt: string;
      configFiles: string[];
      size: number;
    }>;
  }>;

  uninstallRainmeterSkin: (
    skinId: string,
    skinName: string,
    skinPath: string
  ) => Promise<{
    success: boolean;
    error?: string;
    skinId: string;
    message?: string;
  }>;

  // System utilities
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };

  // Verify and regenerate thumbnails for all wallpapers
  verifyWallpaperThumbnails: () => Promise<{
    success: boolean;
    processed: number;
    generated: number;
    cachePath?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
