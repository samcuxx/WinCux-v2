# NSFW Filter Implementation

## Overview

Successfully implemented a professional NSFW content filter for your Wallpaper & Rainmeter Manager app with complete integration with the Wallhaven API.

## Features Implemented

### 1. Settings Context (`lib/contexts/settings-context.tsx`)

- **Global Settings Management**: Created a React context to manage application settings across the entire app
- **NSFW Toggle**: Boolean setting to control NSFW content visibility
- **Cache Management**: Setting to enable/disable caching
- **Persistent Storage**: Settings automatically saved to localStorage
- **Reset Functionality**: Reset all settings to defaults

### 2. Professional Settings Page (`components/pages/settings.tsx`)

- **Content Filter Section**: Professional UI with amber-themed card
- **NSFW Toggle Switch**: Visual switch with red/green color coding
- **Status Indicators**: Real-time visual indicators showing current setting
- **Warning Messages**: Alert when NSFW content is enabled
- **Cache Settings**: Toggle for cache management
- **App Information**: Version and tech stack info
- **Reset Controls**: Dangerous action with confirmation dialog

### 3. Wallpaper Provider Integration (`lib/providers/wallpaper-provider.ts`)

- **Purity Parameter**: Added support for Wallhaven API purity settings
- **SFW Only**: Default setting filters to "100" (SFW only)
- **All Content**: When NSFW enabled, uses "111" (SFW + Sketchy + NSFW)
- **Automatic Integration**: All search methods automatically include purity setting

### 4. Wallpaper Hooks Integration (`hooks/use-wallpapers.ts`)

- **Settings Integration**: Automatically includes current purity setting in all API calls
- **Dynamic Updates**: Listens for setting changes and refreshes content
- **Cache Clearing**: Automatically clears cache when NSFW setting changes
- **Background Refresh**: Updates wallpapers in background when settings change

### 5. Root Layout Integration (`app/layout.tsx`)

- **Settings Provider**: Wrapped entire app with SettingsProvider
- **Global Access**: Settings available throughout the application

## How It Works

### Wallhaven API Purity Values

- **"100"**: SFW (Safe for Work) only - family-friendly content
- **"110"**: SFW + Sketchy - includes suggestive but not explicit content
- **"111"**: SFW + Sketchy + NSFW - includes all content types

### User Experience

1. **Default State**: App starts with NSFW disabled (SFW only)
2. **Settings Page**: User can navigate to settings and toggle NSFW content
3. **Immediate Effect**: When toggled, cache is cleared and wallpapers refresh
4. **Visual Feedback**: Clear indicators show current setting state
5. **Persistent**: Setting saved and restored on app restart

### Technical Flow

1. User toggles NSFW setting in Settings page
2. Settings context updates and saves to localStorage
3. Custom event dispatched to notify components
4. Wallpaper hooks listen for event and clear cache
5. New API requests automatically include updated purity setting
6. Fresh wallpapers loaded with appropriate content filter

## Benefits

### Professional Implementation

- **Type-safe**: Full TypeScript support
- **Reactive**: Immediate updates without page refresh
- **Persistent**: Settings survive app restarts
- **Clean UI**: Professional toggle with visual feedback
- **Safe defaults**: Starts with family-friendly content

### Performance Optimized

- **Smart Caching**: Clears cache only when needed
- **Background Updates**: Smooth user experience
- **Efficient API Usage**: Respects Wallhaven rate limits

### User-Friendly

- **Clear Controls**: Easy to find and use
- **Visual Feedback**: Status indicators and warnings
- **Confirmation**: Reset actions require confirmation
- **Responsive**: Works on all screen sizes

## Usage Instructions

1. **Open Settings**: Click "Settings" in the sidebar
2. **Find Content Filter**: Look for the amber-colored "Content Filter" card
3. **Toggle NSFW**: Use the switch to enable/disable adult content
4. **Warning Display**: When enabled, red warning message appears
5. **Automatic Refresh**: Wallpapers automatically update with new filter
6. **Status Indicator**: Green dot = SFW only, Red dot = All content

## Technical Notes

- Settings are stored in `localStorage` under key `wallpaper-app-settings`
- Cache is automatically cleared when NSFW setting changes
- All wallpaper API calls now include the appropriate purity filter
- The implementation is fully backward compatible
- No breaking changes to existing functionality

Your wallpaper app now has professional NSFW filtering with a clean, user-friendly interface!
