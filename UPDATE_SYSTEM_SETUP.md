# Auto-Update System Setup

This document explains how to set up and use the automatic update system for Desktop Pro.

## Overview

The auto-update system uses `electron-updater` to automatically check for, download, and install updates from GitHub releases. The system is configured to work with GitHub as the update provider.

## Features

- **Automatic Update Checking**: Checks for updates when the app starts (5-second delay)
- **Manual Update Checking**: Users can manually check for updates from the settings page
- **Download Progress**: Shows real-time download progress with file size information
- **Update Notifications**: Global notifications when updates are available
- **Automatic Installation**: Downloads and installs updates with user consent
- **Error Handling**: Comprehensive error handling and retry mechanisms

## Setup Instructions

### 1. GitHub Repository Configuration

The update system is configured to work with GitHub releases. Make sure your `electron-builder.yml` has the correct GitHub configuration:

```yaml
publish:
  provider: "github"
  owner: "SamCux" # Your GitHub username
  repo: "WinCux" # Your repository name
  private: false
  releaseType: "release"
  publishAutoUpdate: true
```

### 2. Building and Publishing Updates

To build and publish an update:

1. **Update the version** in `package.json`:

   ```json
   {
     "version": "1.0.1" // Increment this
   }
   ```

2. **Build and publish** the update:

   ```bash
   npm run publish
   ```

   This command will:

   - Build the application
   - Create a GitHub release
   - Upload the built files
   - Generate the update metadata

### 3. GitHub Token Setup

You'll need a GitHub personal access token with the following permissions:

- `repo` (for private repositories)
- `public_repo` (for public repositories)

Set the token as an environment variable:

```bash
export GH_TOKEN=your_github_token_here
```

### 4. Code Signing (Recommended)

For production releases, you should code sign your application:

**Windows:**

- Obtain a code signing certificate
- Configure in `electron-builder.yml`:
  ```yaml
  win:
    certificateFile: "path/to/certificate.p12"
    certificatePassword: "password"
  ```

**macOS:**

- Use Apple Developer ID
- Configure in `electron-builder.yml`:
  ```yaml
  mac:
    identity: "Developer ID Application: Your Name"
  ```

## How It Works

### Update Flow

1. **App Startup**: The app automatically checks for updates 5 seconds after startup
2. **Update Detection**: If an update is available, the system notifies the user
3. **User Consent**: User can choose to download the update or postpone
4. **Download**: Shows progress bar with download speed and file size
5. **Installation**: User confirms installation, app restarts with new version

### User Interface

#### Settings Page

- **Update Settings Section**: Shows current version and update status
- **Manual Check**: Button to manually check for updates
- **Download Progress**: Real-time progress during download
- **Install Button**: Appears when update is ready to install

#### Global Notifications

- **Floating Badge**: Appears in bottom-right corner when update is available
- **Update Dialog**: Detailed update information and actions
- **Progress Tracking**: Shows download progress in real-time

### Update States

- `idle`: No update activity
- `checking`: Checking for updates
- `available`: Update is available for download
- `downloading`: Update is being downloaded
- `downloaded`: Update is ready to install
- `error`: An error occurred during the update process

## Development vs Production

### Development Mode

- Update checks are disabled in development mode
- No automatic update checking
- Manual testing still possible

### Production Mode

- Automatic update checking enabled
- Full update functionality available
- Requires proper GitHub release setup

## Troubleshooting

### Common Issues

1. **Update Not Detected**

   - Verify GitHub release exists
   - Check version number in `package.json`
   - Ensure release has proper assets

2. **Download Fails**

   - Check internet connection
   - Verify GitHub token permissions
   - Check release asset accessibility

3. **Installation Fails**
   - Ensure app has write permissions
   - Check antivirus software interference
   - Verify code signing (if applicable)

### Debugging

Enable debug logging by adding to `main/handlers/update-handlers.js`:

```javascript
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "debug";
```

## Security Considerations

1. **Code Signing**: Always code sign releases for production
2. **HTTPS**: Updates are served over HTTPS from GitHub
3. **Integrity**: Electron-updater verifies file integrity
4. **User Consent**: Updates require explicit user consent

## Customization

### Update Check Frequency

Modify the delay in `main/handlers/update-handlers.js`:

```javascript
setTimeout(() => {
  // Update check logic
}, 5000); // Change this value (in milliseconds)
```

### Notification Behavior

Customize notification timing in `components/ui/global-update-notification.tsx`:

```javascript
// Auto-show notification when update becomes available
useEffect(() => {
  if (updateStatus.status === "available" && !hasShownAutoNotification) {
    setShowNotification(true);
    setHasShownAutoNotification(true);
  }
}, [updateStatus.status, hasShownAutoNotification]);
```

### Update Channels

To support different update channels (stable, beta, etc.), modify the `publish` configuration in `electron-builder.yml`:

```yaml
publish:
  provider: "github"
  owner: "SamCux"
  repo: "WinCux"
  private: false
  releaseType: "prerelease" # For beta releases
```

## Best Practices

1. **Version Management**: Use semantic versioning (e.g., 1.0.0, 1.0.1, 1.1.0)
2. **Release Notes**: Always include release notes in GitHub releases
3. **Testing**: Test updates thoroughly before publishing
4. **Rollback Plan**: Keep previous versions available for emergency rollbacks
5. **User Communication**: Inform users about major updates and breaking changes

## API Reference

### Main Process API

- `setupUpdateHandlers(window)`: Initialize update handlers
- `autoUpdater.checkForUpdates()`: Check for available updates
- `autoUpdater.downloadUpdate()`: Download the update
- `autoUpdater.quitAndInstall()`: Install and restart the app

### Renderer Process API

- `updateAPI.checkForUpdates()`: Check for updates
- `updateAPI.downloadUpdate()`: Download update
- `updateAPI.installUpdate()`: Install update
- `updateAPI.getUpdateInfo()`: Get current update information

### React Hook

- `useUpdates()`: Hook for managing update state and actions
  - `updateStatus`: Current update status
  - `updateInfo`: Update information
  - `checkForUpdates()`: Manual update check
  - `downloadUpdate()`: Download update
  - `installUpdate()`: Install update
