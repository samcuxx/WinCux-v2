import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { SettingsPage } from "@/components/pages/settings";

export default function Settings() {
  return (
    <AppLayout title="Settings">
      <SettingsPage />
    </AppLayout>
  );
}
