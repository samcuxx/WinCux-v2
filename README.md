# Wallpaper & Rainmeter Manager

A professional Windows 11-style desktop application for managing wallpapers and Rainmeter skins. Built with Electron, Next.js, Tailwind CSS, and shadcn/ui components.

## Features

### ✅ Task 1 Completed: Core Application Structure & Windows 11 Design

- **Modern Windows 11 Aesthetics**: Clean, professional design with Fluent Design System elements
- **Custom Title Bar**: Frameless window with custom window controls (minimize, maximize, close)
- **Navigation Sidebar**: Beautiful sidebar with gradient icons and smooth animations
- **Section Routing**: Navigate between Home, Wallpapers, Rainmeter, and Settings
- **Responsive Layout**: Optimized for desktop usage with proper scaling
- **Windows 11 Styling**: Acrylic effects, modern shadows, and professional color schemes
- **Light/Dark Mode**: Seamless theme switching with next-themes integration
- **Theme Toggle**: Beautiful animated theme toggle in sidebar and settings

### 🚧 Upcoming Tasks

- **Task 2**: Wallpapers Section - UI & Gallery
- **Task 3**: Wallpapers Section - Download & Set Functionality
- **Task 4**: Rainmeter Section - Detection & Installation
- **Task 5**: Rainmeter Section - Skin Management
- **Task 6**: System Integration & Polish
- **Task 7**: Final Polish & Professional Features

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Desktop**: Electron 28
- **Styling**: Tailwind CSS with custom Windows 11 components
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Theme System**: next-themes for light/dark mode
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application with sidebar navigation
│   ├── layout.tsx         # Root layout with theme provider
│   └── globals.css        # Global styles + Windows 11 components
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── theme-provider.tsx # Theme context provider
│   └── theme-toggle.tsx   # Theme toggle component
├── main/                  # Electron main process
│   ├── main.js           # Main process with window controls
│   └── preload.js        # Preload script for IPC
├── types/                 # TypeScript definitions
│   └── electron.d.ts     # Electron API types
└── public/               # Static assets
```

## Windows 11 Design Features

### 🎨 Visual Design

- **Acrylic Background Effects**: Backdrop blur and transparency
- **Fluent Design Colors**: Professional gradient system
- **Modern Shadows**: Multi-layered shadow system
- **Mica Background**: Subtle texture effects
- **Grid Pattern Overlay**: Subtle background patterns
- **Dark Mode Support**: Beautiful dark theme with proper contrast

### 🖱️ Interactions

- **Smooth Animations**: CSS animations with easing
- **Hover Effects**: Interactive feedback on all elements
- **Gradient Buttons**: Beautiful gradient backgrounds
- **Icon Animations**: Pulsing and scaling effects
- **Theme Transitions**: Smooth transitions between light/dark modes

### 🪟 Window Management

- **Custom Title Bar**: Professional window header
- **Window Controls**: Native minimize, maximize, close
- **Drag Region**: Proper window dragging support
- **Frame Handling**: Seamless integration with Windows

## Theme System

### 🌙 Light/Dark Mode Features

- **System Theme Detection**: Automatically follows system preferences
- **Manual Toggle**: Click the theme toggle in sidebar or settings
- **Persistent Preferences**: Theme choice is saved across sessions
- **Smooth Transitions**: Animated transitions between themes
- **Optimized Colors**: Carefully crafted color palettes for both modes

### 🎨 Theme Implementation

- **next-themes Integration**: Professional theme management
- **CSS Variables**: Dynamic color system with CSS custom properties
- **Component Theming**: All components support both light and dark modes
- **Accessibility**: Proper contrast ratios in all themes

## Development

### Running the App

```bash
# Development mode (Next.js + Electron)
npm run dev

# Build and package
npm run build
```

### Key Components

#### Main Layout (`app/page.tsx`)

- Sidebar navigation with 4 main sections
- Dynamic content rendering based on active section
- Window controls integration
- Theme toggle integration
- Responsive design system

#### Theme System

- **ThemeProvider**: Context provider for theme state
- **ThemeToggle**: Animated toggle component with sun/moon icons
- **CSS Variables**: Dynamic theming with Tailwind CSS
- **System Integration**: Respects user's system preferences

#### Window Controls

- Custom title bar with app branding
- Native window control functionality
- Electron IPC integration
- Cross-platform compatibility

#### Navigation System

- Visual feedback for active sections
- Gradient-based section identification
- Smooth transitions between sections
- Professional iconography

## Current Implementation Status

### ✅ Completed

- [x] Modern Windows 11 layout structure
- [x] Custom window controls with Electron IPC
- [x] Professional sidebar navigation
- [x] Section-based routing system
- [x] Windows 11 styling and animations
- [x] Responsive design framework
- [x] Typography and color system
- [x] Background effects and patterns
- [x] Light/Dark mode theme system
- [x] Animated theme toggle component
- [x] Enhanced settings page with theme controls

### 🔄 In Progress

- [ ] Wallpaper gallery implementation
- [ ] Rainmeter detection system
- [ ] File download functionality
- [ ] System integration features

### 📋 Next Tasks

1. **Wallpaper Gallery**: Create wallpaper browsing interface
2. **Download System**: Implement wallpaper downloading
3. **Wallpaper Setting**: Add functionality to set desktop wallpaper
4. **Rainmeter Detection**: Check if Rainmeter is installed
5. **Rainmeter Installation**: Install via winget command
6. **Skin Management**: Browse and install Rainmeter skins

## Design Philosophy

This application follows Microsoft's Fluent Design System principles:

- **Light**: Intuitive and familiar interactions
- **Depth**: Layered visual hierarchy
- **Motion**: Smooth, purposeful animations
- **Material**: Physical textures and transparency
- **Scale**: Responsive across different screen sizes

## Technical Notes

- Uses Electron's `contextIsolation` for security
- Implements proper IPC communication patterns
- Custom CSS classes for Windows 11 effects
- TypeScript for type safety
- Modern ES6+ JavaScript features
- Theme system with CSS variables and next-themes
- Smooth animations and transitions

---

**Status**: Task 1 Complete + Theme System Added - Ready for Task 2 Implementation

The application now has a professional Windows 11-style foundation with complete light/dark mode support, ready for implementing the core wallpaper and Rainmeter functionality.
# WinCux-v2
