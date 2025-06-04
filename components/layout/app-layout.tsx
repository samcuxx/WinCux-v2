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
    <div className="">
      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Top Bar */}
          <TopBar title={title} />

          {/* Content Area */}
          <ScrollArea className="h-[calc(100vh-3rem)] custom-scrollbar bg-background">
            <div className="p-6">{children}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
