# Wallpaper API Integration - Wallhaven (Electron IPC)

This document explains the professional wallpaper system that has been implemented with Wallhaven API integration using Electron's IPC (Inter-Process Communication) for production builds.

## Overview

The wallpaper system has been restructured to work seamlessly in both development and production Electron environments. The API calls are now handled through Electron's main process via IPC, which is the recommended approach for Electron applications.

## Architecture

### Why IPC Instead of Direct API Calls?

1. **Security**: API keys and credentials stay in the main process
2. **No CORS Issues**: The main process can make direct HTTP requests
3. **Better Performance**: Native Node.js HTTP handling
4. **Static Export Compatibility**: Works with Next.js static export required for Electron production builds

### Core Components

1. **Main Process API Handlers** (`main/main.js`)

   - Wallhaven API configuration and HTTP request handling
   - IPC handlers for all API endpoints
   - Rate limiting and error handling

2. **Preload Script** (`main/preload.js`)

   - Exposes secure IPC methods to the renderer process
   - Bridge between main and renderer processes

3. **API Service Layer** (`lib/services/wallhaven-api.ts`)

   - Updated to use IPC instead of fetch
   - Maintains the same interface for components
   - Automatic fallback for development environments

4. **Type Definitions** (`types/wallhaven.ts`)
   - Complete TypeScript interfaces for Wallhaven API
   - Local wallpaper type for UI compatibility

## Implementation Details

### Main Process (main/main.js)

```javascript
// Wallhaven API Configuration
const WALLHAVEN_CONFIG = {
  BASE_URL: "https://wallhaven.cc/api/v1",
  API_KEY: "6hD9gTaTNnsq9bWXPbyjugN0QSrT76hi",
  // ... other config
};

// IPC Handlers
ipcMain.handle("wallhaven-search", async (event, params) => {
  // Direct HTTP request to Wallhaven API
  const response = await makeHttpRequest(url);
  return response;
});
```

### Preload Script (main/preload.js)

```javascript
contextBridge.exposeInMainWorld("electronAPI", {
  // Wallhaven API methods
  wallhavenSearch: (params) => ipcRenderer.invoke("wallhaven-search", params),
  wallhavenWallpaper: (id) => ipcRenderer.invoke("wallhaven-wallpaper", id),
  // ... other methods
});
```

### Renderer Process (lib/services/wallhaven-api.ts)

```typescript
private async makeRequest<T>(endpoint: string, params: any): Promise<T> {
  // Use IPC instead of fetch
  const response = await (window as any).electronAPI.wallhavenSearch(params);
  return response;
}
```

## Available API Methods

### Search Wallpapers

```typescript
// Main process handler: wallhaven-search
const results = await wallhavenAPI.searchWallpapers({
  q: "nature",
  categories: "100",
  purity: "100",
  page: 1,
});
```

### Get Wallpaper Details

```typescript
// Main process handler: wallhaven-wallpaper
const wallpaper = await wallhavenAPI.getWallpaper("wallpaper_id");
```

### Get Tag Information

```typescript
// Main process handler: wallhaven-tag
const tag = await wallhavenAPI.getTagInfo("tag_id");
```

### Get User Settings

```typescript
// Main process handler: wallhaven-settings (requires API key)
const settings = await wallhavenAPI.getUserSettings();
```

### Test API Configuration

```typescript
// Main process handler: wallhaven-test
const status = await wallhavenAPI.testConnection();
```

## Environment Setup

### API Key Configuration

The API key is configured directly in the main process:

```javascript
const WALLHAVEN_CONFIG = {
  API_KEY: "6hD9gTaTNnsq9bWXPbyjugN0QSrT76hi", // Your API key here
  // ... other config
};
```

### Development vs Production

- **Development**: The app runs with Next.js dev server, API calls work through IPC
- **Production**: Static export with full IPC integration, no external API dependencies

## Usage in Components

The API service maintains the same interface, so existing components work without changes:

```typescript
import { wallhavenAPI } from "@/lib/services/wallhaven-api";

// Works in both development and production
const searchResults = await wallhavenAPI.searchWallpapers({
  q: searchQuery,
  page: currentPage,
});
```

## Benefits of This Approach

1. **Security**: API keys never exposed to the renderer process
2. **Performance**: Native Node.js HTTP handling in main process
3. **Compatibility**: Works with static export for Electron production
4. **Maintainability**: Clean separation between main and renderer processes
5. **Extensibility**: Easy to add new API endpoints or sources

## Troubleshooting

### API Not Available Error

- Ensure you're running in Electron environment
- Check that preload script is properly loaded
- Verify IPC handlers are registered in main process

### Build Issues

- Make sure no API routes exist in the Next.js app directory
- Confirm Next.js is configured for static export
- Check that all API logic is moved to main process

This architecture provides a robust, secure, and performant foundation for the wallpaper system in WinCux.
