# NSFW Filter Automatic Refresh Fixes

## Issues Fixed

### 1. **Manual Cache Clearing Required**

**Problem**: When toggling NSFW setting, users had to manually go to wallpapers page, open cache statistics, clear cache, and refresh.

**Solution**: Implemented automatic cache clearing and wallpaper refresh when NSFW setting changes.

### 2. **Duplicate Cache Management Systems**

**Problem**: Settings page and wallpapers page had separate cache management that didn't work together.

**Solution**: Unified cache management through the settings context.

## Technical Fixes Implemented

### 1. Enhanced Settings Context (`lib/contexts/settings-context.tsx`)

```typescript
// Before: Basic event dispatch
const setAllowNSFW = (allow: boolean) => {
  setAllowNSFWState(allow);
  // Basic event dispatch
};

// After: Immediate cache clearing + detailed event
const setAllowNSFW = (allow: boolean) => {
  console.log("NSFW setting changing from", allowNSFW, "to", allow);
  setAllowNSFWState(allow);

  // Clear cache immediately when NSFW setting changes
  wallpaperProvider.clearCache();

  // Dispatch detailed event with purity setting
  const event = new CustomEvent("nsfw-setting-changed", {
    detail: {
      allowNSFW: allow,
      puritySetting: allow ? "111" : "100",
    },
  });
  window.dispatchEvent(event);
};
```

**Key Improvements**:

- **Immediate Cache Clearing**: Cache is cleared instantly when setting changes
- **Detailed Event Data**: Event includes both boolean flag and API purity setting
- **Better Logging**: Console logs for debugging
- **Unified Cache Management**: Added `clearCache()` and `getCacheStats()` methods

### 2. Improved Event Handling (`hooks/use-wallpapers.ts`)

```typescript
// Before: Basic event listener
const handleNSFWSettingChange = () => {
  wallpaperProvider.clearCache();
  if (currentOptions) {
    performSearch(currentOptions, true);
  }
};

// After: Robust event handling with immediate refresh
const handleNSFWSettingChange = (event: CustomEvent) => {
  console.log("NSFW setting change detected:", event.detail);

  // Clear cache immediately
  wallpaperProvider.clearCache();
  setIsFromCache(false);
  setCacheAge(undefined);

  // Refresh with new purity setting immediately
  if (currentOptions && !isLoading) {
    performSearch(
      {
        ...currentOptions,
        purity: event.detail.puritySetting,
      },
      true
    ).catch((error) => {
      console.error("Failed to refresh:", error);
    });
  }
};
```

**Key Improvements**:

- **Event Data Usage**: Uses purity setting from event detail
- **Loading State Check**: Prevents overlapping requests
- **Error Handling**: Catches and logs refresh errors
- **State Updates**: Immediately updates cache indicators
- **TypeScript Safety**: Proper event typing

### 3. Unified Cache Management

**Settings Page**:

```typescript
// Now uses unified cache from settings context
const { clearCache, getCacheStats } = useSettings();
const cacheStats = getCacheStats();
```

**Wallpapers Page**:

```typescript
// Uses same unified cache system
const { clearCache: clearSettingsCache, getCacheStats: getSettingsCacheStats } =
  useSettings();
const cacheStats = useMemo(
  () => getSettingsCacheStats(),
  [getSettingsCacheStats, wallpapers.length]
);
```

### 4. Visual Status Indicators

**Settings Page**:

- Added cache statistics section with real-time data
- Clear cache button integrated into settings
- Visual status indicators for cache health

**Wallpapers Page**:

- Added NSFW filter status indicator in header
- Shows "SFW Only" or "All Content" with color coding
- Green shield for SFW, red shield for all content

## User Experience Improvements

### Automatic Behavior

1. **Toggle NSFW in Settings** → **Immediate Effect**

   - Cache cleared instantly
   - Wallpapers page automatically refreshes
   - No manual intervention needed

2. **Visual Feedback**

   - Settings page shows current NSFW state
   - Wallpapers page shows filter status in header
   - Cache statistics update in real-time

3. **Error Prevention**
   - Won't start new refresh if one is already running
   - Proper error handling and logging
   - Graceful fallback behavior

### Status Indicators

**Settings Page**:

- 🟢 Green eye + "SFW Only" when NSFW disabled
- 🔴 Red eye-off + "All Content" when NSFW enabled
- Warning message when NSFW is active
- Cache statistics with health status

**Wallpapers Page**:

- 🛡️ Green shield + "SFW Only" when filtering
- 🛡️ Red shield + "All Content" when showing all
- Real-time cache age indicators
- Connection status indicators

## Technical Flow

```
User toggles NSFW in Settings
       ↓
Settings Context:
  1. Updates state
  2. Clears cache immediately
  3. Saves to localStorage
  4. Dispatches detailed event
       ↓
Wallpapers Hook:
  1. Receives event
  2. Clears cache indicators
  3. Starts new search with correct purity
  4. Updates wallpapers automatically
       ↓
UI Updates:
  1. Settings shows new state
  2. Wallpapers page shows new content
  3. Status indicators update
  4. No manual action needed
```

## Benefits

✅ **Seamless UX**: No manual cache clearing needed
✅ **Unified System**: Single source of truth for cache
✅ **Visual Feedback**: Clear status indicators everywhere
✅ **Error Resilient**: Proper error handling and logging
✅ **Performance**: Smart refresh only when needed
✅ **Type Safe**: Full TypeScript support

The NSFW filter now works exactly as expected - toggle the setting and wallpapers automatically refresh with the correct content filter applied!
