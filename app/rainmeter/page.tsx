import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RainmeterPage } from "@/components/pages/rainmeter";

export default function Rainmeter() {
  return (
    <AppLayout title="Rainmeter">
      <RainmeterPage />
    </AppLayout>
  );
}
