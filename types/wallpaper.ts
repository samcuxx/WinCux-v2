import { LocalWallpaper } from "./wallhaven";

// Enhanced interface for local wallpapers with additional properties
export interface ExtendedLocalWallpaper extends LocalWallpaper {
  filename: string;
  path: string;
  file_size: number;
}
