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

      

  
    </div>
  );
}
