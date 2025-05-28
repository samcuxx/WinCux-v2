"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { Minimize2, Square, X } from "lucide-react";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const [isElectron, setIsElectron] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're running in Electron
    setIsElectron(
      typeof window !== "undefined" && window.electronAPI !== undefined
    );
  }, []);

  const handleWindowControl = async (
    action: "minimize" | "maximize" | "close"
  ) => {
    if (!isElectron) return;

    try {
      switch (action) {
        case "minimize":
          await window.electronAPI.minimizeWindow();
          break;
        case "maximize":
          await window.electronAPI.maximizeWindow();
          break;
        case "close":
          await window.electronAPI.closeWindow();
          break;
      }
    } catch (error) {
      console.error("Window control error:", error);
    }
  };

 

  return (
    <div
      className="flex items-center justify-end h-12 px-6  "
      style={{ WebkitAppRegion: "drag" } as any}
    >
   

      {/* Window Controls */}
      {isElectron && (
        <div
          className="flex items-center space-x-1"
          style={{ WebkitAppRegion: "no-drag" } as any}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
            onClick={() => handleWindowControl("minimize")}
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
            onClick={() => handleWindowControl("maximize")}
          >
            <Square className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 hover:bg-red-500 hover:text-white rounded-md"
            onClick={() => handleWindowControl("close")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
