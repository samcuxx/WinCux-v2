"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Settings,
  Palette,
  HardDrive,
  Shield,
  FolderOpen,
  Trash2,
  Info,
} from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Application Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Customize your experience and manage application preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Theme</span>
                <p className="text-xs text-muted-foreground">
                  Choose between light, dark, or system theme
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Animations</span>
                <p className="text-xs text-muted-foreground">
                  Enable smooth transitions and effects
                </p>
              </div>
              <Button size="sm" variant="outline">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Blur Effects</span>
                <p className="text-xs text-muted-foreground">
                  Apply backdrop blur to interface elements
                </p>
              </div>
              <Button size="sm" variant="outline">
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
            <CardDescription>
              Configure general application behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">
                  Auto-update wallpapers
                </span>
                <p className="text-xs text-muted-foreground">
                  Download new wallpapers automatically
                </p>
              </div>
              <Button size="sm" variant="outline">
                Disabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Start with Windows</span>
                <p className="text-xs text-muted-foreground">
                  Launch app when Windows starts
                </p>
              </div>
              <Button size="sm" variant="outline">
                Disabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Minimize to tray</span>
                <p className="text-xs text-muted-foreground">
                  Keep app running in system tray
                </p>
              </div>
              <Button size="sm" variant="outline">
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Storage & Cache */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5" />
              <span>Storage & Cache</span>
            </CardTitle>
            <CardDescription>
              Manage application storage and downloaded content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Cache size</span>
                <p className="text-xs text-muted-foreground">
                  Currently using 0 MB of storage
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Download location</span>
                <p className="text-xs text-muted-foreground">
                  Choose where to save wallpapers
                </p>
              </div>
              <Button size="sm" variant="outline">
                <FolderOpen className="w-3 h-3 mr-1" />
                Browse
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Auto-cleanup</span>
                <p className="text-xs text-muted-foreground">
                  Remove old downloads automatically
                </p>
              </div>
              <Button size="sm" variant="outline">
                30 days
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Advanced</span>
            </CardTitle>
            <CardDescription>
              Advanced configuration and developer options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">
                  Hardware acceleration
                </span>
                <p className="text-xs text-muted-foreground">
                  Use GPU for better performance
                </p>
              </div>
              <Button size="sm" variant="outline">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Debug mode</span>
                <p className="text-xs text-muted-foreground">
                  Show developer console and logs
                </p>
              </div>
              <Button size="sm" variant="outline">
                Disabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Telemetry</span>
                <p className="text-xs text-muted-foreground">
                  Help improve the app by sharing usage data
                </p>
              </div>
              <Button size="sm" variant="outline">
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>About Desktop Pro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
              <div className="text-sm text-muted-foreground">
                Current Version
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5,000+</div>
              <div className="text-sm text-muted-foreground">Wallpapers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2,400</div>
              <div className="text-sm text-muted-foreground">
                Rainmeter Skins
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
