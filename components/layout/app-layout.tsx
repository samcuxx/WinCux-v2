"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Top Bar */}
          <TopBar title={title} />

          {/* Content Area */}
          <ScrollArea className="h-[calc(100vh-3rem)] custom-scrollbar">
            <div className="p-6">{children}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
