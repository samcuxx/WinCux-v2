import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { WallpapersPage } from "@/components/pages/wallpapers";

export default function Wallpapers() {
  return (
    <AppLayout title="Wallpapers">
      <WallpapersPage />
    </AppLayout>
  );
}
