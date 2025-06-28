"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { UpdateNotification } from "./update-notification";
import { useUpdates } from "../../hooks/use-updates";
import { Badge } from "./badge";
import { Button } from "./button";
import { Download } from "lucide-react";

export function GlobalUpdateNotification() {
  const { updateStatus, updateInfo } = useUpdates();
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownAutoNotification, setHasShownAutoNotification] =
    useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-show notification when update becomes available
  useEffect(() => {
    if (updateStatus.status === "available" && !hasShownAutoNotification) {
      setShowNotification(true);
      setHasShownAutoNotification(true);
    }
  }, [updateStatus.status, hasShownAutoNotification]);

  // Reset auto-notification flag when status changes
  useEffect(() => {
    if (
      updateStatus.status === "idle" ||
      updateStatus.status === "not-available"
    ) {
      setHasShownAutoNotification(false);
    }
  }, [updateStatus.status]);

  // Don't render anything if not on client or no update activity
  if (
    !isClient ||
    updateStatus.status === "idle" ||
    updateStatus.status === "not-available"
  ) {
    return null;
  }

  return (
    <>
      {/* Floating notification badge */}
      {updateStatus.status === "available" && !showNotification && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowNotification(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center rounded-full px-4 py-2 transition-all duration-200 hover:shadow-xl"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Update Available
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
              {updateInfo?.updateInfo?.version
                ? `v${updateInfo.updateInfo.version}`
                : "New"}
            </Badge>
          </Button>
        </div>
      )}

      {/* Update dialog */}
      <Dialog open={showNotification} onOpenChange={setShowNotification}>
        <DialogContent className="sm:max-w-md border-0 shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Software Update
            </DialogTitle>
          </DialogHeader>
          <UpdateNotification onClose={() => setShowNotification(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
