"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 rounded-full hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 group relative overflow-hidden"
    >
      <div className="relative z-10">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      </div>
      {/* Background gradient that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-blue-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
