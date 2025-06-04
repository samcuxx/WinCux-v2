"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Image, Gauge, Settings, Download } from "lucide-react";

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    gradient: "from-blue-500 to-purple-500",
  },
  {
    name: "Wallpapers",
    href: "/wallpapers",
    icon: Image,
    gradient: "from-blue-600 to-purple-600",
  },
  {
    name: "Downloads",
    href: "/downloads",
    icon: Download,
    gradient: "from-purple-600 to-pink-600",
  },
  {
    name: "Rainmeter",
    href: "/rainmeter",
    icon: Gauge,
    gradient: "from-green-600 to-blue-600",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-orange-500 to-red-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Function to determine if a navigation item is active
  const isActiveRoute = (href: string) => {
    if (href === "/") {
      // Home page - exact match only
      return pathname === "/" || pathname === "";
    }
    // Other pages - match if pathname starts with the href
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64  flex flex-col ">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                    : "bg-gray-200/50 dark:bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:" +
                        item.gradient
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-white"
                  )}
                />
              </div>
              <span
                className={cn(
                  "font-medium transition-colors duration-200 text-white",
                  isActive ? "text-blue-700 dark:text-blue-300" : ""
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
