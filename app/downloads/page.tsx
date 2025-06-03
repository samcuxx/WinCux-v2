import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { DownloadsPage } from "@/components/pages/downloads";

export default function Downloads() {
  return (
    <AppLayout title="Downloads">
      <DownloadsPage />
    </AppLayout>
  );
}
