# Modular Architecture Documentation

## Overview

The application has been successfully refactored into a professional, modular structure that separates concerns and improves maintainability. The previous monolithic `main.js` (1600+ lines) has been split into focused, single-responsibility modules.

## Project Structure

```
main/
├── main.js                    # Entry point and window management (100 lines)
├── preload.js                # Organized preload bridge with internal modules (85 lines)
├── config/
│   └── wallhaven-config.js   # Wallhaven API configuration
├── utils/
│   └── http-utils.js         # HTTP request utilities
├── handlers/                 # IPC handlers (main process)
│   ├── window-handlers.js    # Window control operations
│   ├── wallpaper-handlers.js # Wallpaper download/set operations
│   ├── rainmeter-handlers.js # Rainmeter management operations
│   └── wallhaven-handlers.js # Wallhaven API operations
└── preload/                  # Reference API modules (for documentation)
    ├── window-api.js         # Window control API reference
    ├── wallpaper-api.js      # Wallpaper operations API reference
    ├── rainmeter-api.js      # Rainmeter management API reference
    └── wallhaven-api.js      # Wallhaven API bridge reference
```

## Architecture Benefits

### 1. **Separation of Concerns**

- Each module has a single, well-defined responsibility
- Business logic is isolated from IPC communication
- Configuration is centralized and reusable

### 2. **Maintainability**

- Smaller, focused files are easier to understand and modify
- Changes to one feature don't affect unrelated functionality
- Consistent naming and structure across modules

### 3. **Testability**

- Individual modules can be unit tested independently
- Mock dependencies are easier to inject
- Reduced coupling between components

### 4. **Scalability**

- New features can be added as separate modules
- Existing modules can be extended without affecting others
- Clear patterns for future development

## Module Descriptions

### Main Process Handlers

#### `main.js` (100 lines)

- **Purpose**: Application entry point and window management
- **Responsibilities**: Window creation, dev server connection, handler setup
- **Dependencies**: All handler modules

#### `window-handlers.js` (27 lines)

- **Purpose**: Window control operations (minimize, maximize, close)
- **Exports**: `setupWindowHandlers(win)`
- **Dependencies**: Electron IPC main

#### `wallpaper-handlers.js` (322 lines)

- **Purpose**: Wallpaper download, file management, and desktop setting
- **Exports**: `setupWallpaperHandlers()`
- **Features**:
  - Download wallpapers to Pictures/Wallpapers folder
  - Check file existence and get local wallpapers as base64
  - Cross-platform desktop wallpaper setting
  - File system operations with error handling

#### `rainmeter-handlers.js` (980 lines)

- **Purpose**: Complete Rainmeter integration and skin management
- **Exports**: `setupRainmeterHandlers()`
- **Features**:
  - Rainmeter detection and installation via winget
  - Skin download, installation, and management
  - Configuration opening and skin toggling
  - Directory operations and cleanup

#### `wallhaven-handlers.js` (124 lines)

- **Purpose**: Wallhaven API integration
- **Exports**: `setupWallhavenHandlers()`
- **Features**:
  - Search wallpapers with parameters
  - Get wallpaper details and metadata
  - Tag information retrieval
  - User settings and API testing

### Preload Bridge Architecture

#### `preload.js` (85 lines)

- **Purpose**: Secure bridge between main and renderer processes
- **Structure**: Organized internal modules for different functionalities
- **Modules**:
  - **windowAPI**: Window control functions
  - **wallpaperAPI**: Wallpaper operation functions
  - **rainmeterAPI**: Rainmeter management functions
  - **wallhavenAPI**: Wallhaven API bridge functions

**Note**: The preload APIs are implemented as internal modules within `preload.js` rather than separate files due to Electron's preload context restrictions on requiring external modules.

### Configuration & Utilities

#### `wallhaven-config.js` (23 lines)

- **Purpose**: Centralized API configuration
- **Exports**: `WALLHAVEN_CONFIG` with endpoints, keys, and defaults

#### `http-utils.js` (50 lines)

- **Purpose**: Reusable HTTP request functionality
- **Exports**: `makeHttpRequest()` with Promise-based interface

## Usage Patterns

### Adding New Handlers

1. Create handler file in `main/handlers/`
2. Export setup function that registers IPC handlers
3. Import and call setup function in `main.js`
4. Add corresponding API functions to appropriate module in `preload.js`

### Example Handler Structure

```javascript
const { ipcMain } = require("electron");

function setupFeatureHandlers() {
  ipcMain.handle("feature-action", async (event, params) => {
    try {
      // Implementation here
      return { success: true, data: result };
    } catch (error) {
      console.error("Feature error:", error);
      throw error;
    }
  });
}

module.exports = { setupFeatureHandlers };
```

### Example Preload API Addition

```javascript
// In preload.js - add to appropriate API module
const featureAPI = {
  actionName: (params) => ipcRenderer.invoke("feature-action", params),
};

// Then include in the main electronAPI object
contextBridge.exposeInMainWorld("electronAPI", {
  // ... existing APIs
  ...featureAPI,
});
```

## Migration Results

### Code Reduction & Organization

- **Main file**: Reduced from 1600+ to 100 lines (94% reduction)
- **Handlers**: Split into 4 focused modules (27-980 lines each)
- **Configuration**: Centralized in dedicated files
- **Utilities**: Reusable across modules

### Maintainability Improvements

- **Single Responsibility**: Each module has one clear purpose
- **Loose Coupling**: Modules interact through well-defined interfaces
- **High Cohesion**: Related functionality grouped together
- **Clear Dependencies**: Import structure shows relationships

### Development Benefits

- **Easier Debugging**: Issues isolated to specific modules
- **Faster Development**: Clear patterns for adding features
- **Better Testing**: Individual modules can be tested in isolation
- **Documentation**: Each module has clear purpose and interface

## Frontend Compatibility

The modular structure maintains 100% compatibility with existing frontend components:

- `wallpapers.tsx` - Uses wallpaper and wallhaven APIs
- `rainmeter.tsx` - Uses rainmeter management APIs
- `settings.tsx` - Uses general electron APIs

All existing functionality is preserved while providing a much cleaner and more maintainable codebase.

## Technical Notes

### Electron Preload Context

Due to Electron's security model, the preload script runs in a restricted context where requiring external modules can fail. The current implementation uses internal modules within `preload.js` to maintain organization while ensuring compatibility.

### Handler Setup Pattern

All handlers follow a consistent pattern of exporting a setup function that registers IPC handlers. This makes it easy to add new functionality and maintain existing features.

### Error Handling

Each handler includes comprehensive error handling with logging, ensuring that failures are properly reported and don't crash the application.
