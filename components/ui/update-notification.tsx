"use client";

import React, { useEffect } from "react";
import { Button } from "./button";
import { Progress } from "./progress";
import { Badge } from "./badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useUpdates } from "../../hooks/use-updates";

interface UpdateNotificationProps {
  onClose?: () => void;
}

export function UpdateNotification({ onClose }: UpdateNotificationProps) {
  const {
    updateStatus,
    updateInfo,
    reminderState,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    remindLater,
    isClient,
  } = useUpdates();

  // Don't render anything during SSR or initial client load
  if (!isClient) {
    return null;
  }

  // Only hide if we explicitly know we shouldn't show (avoid flickering)
  const shouldHide =
    updateStatus.status === "idle" ||
    updateStatus.status === "not-available" ||
    (reminderState && !reminderState.shouldShow);

  if (shouldHide) {
    return null;
  }

  const handleRemindLater = async () => {
    try {
      const result = await remindLater();
      if (!result.success) {
        console.warn("Failed to set reminder:", result.error);
      }
    } catch (error) {
      console.error("Error setting reminder:", error);
    }

    // Always close the notification, even if setting the reminder failed
    if (onClose) {
      onClose();
    }
  };

  const renderContent = () => {
    switch (updateStatus.status) {
      case "checking":
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <span className="text-center font-medium">
              Checking for updates...
            </span>
          </div>
        );

      case "available":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  New Version Available
                </Badge>
                {updateInfo?.updateInfo?.version && (
                  <span className="text-sm font-medium">
                    v{updateInfo.updateInfo.version}
                  </span>
                )}
              </div>
            </div>
            {updateInfo?.updateInfo?.releaseNotes && (
              <div className="rounded-md bg-muted/50 p-4">
                <p className="font-medium mb-2">What&apos;s new:</p>
                <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                  {updateInfo.updateInfo.releaseNotes}
                </div>
              </div>
            )}
            <Button
              onClick={downloadUpdate}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Update
            </Button>
          </div>
        );

      case "downloading":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Downloading update...</span>
              {updateStatus.progress && (
                <span className="text-sm font-medium">
                  {Math.round(updateStatus.progress.percent)}%
                </span>
              )}
            </div>
            {updateStatus.progress && (
              <div className="relative w-full">
                <Progress
                  value={updateStatus.progress.percent}
                  className="w-full h-2 bg-muted"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {Math.round(
                      updateStatus.progress.transferred / 1024 / 1024
                    )}
                    MB
                  </span>
                  <span className="flex items-center">
                    <ArrowRight className="h-3 w-3 mx-1" />
                    {Math.round(updateStatus.progress.total / 1024 / 1024)}MB
                  </span>
                  <span className="text-xs">
                    {Math.round(updateStatus.progress.bytesPerSecond / 1024)}{" "}
                    KB/s
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case "downloaded":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">
                Update downloaded successfully!
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              The update is ready to install. The application will restart to
              apply the update.
            </p>
            <Button
              onClick={installUpdate}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Install & Restart
            </Button>
          </div>
        );

      case "error":
        const isSignatureError =
          updateStatus.error?.includes("is not signed") ||
          updateStatus.error?.includes("not signed by the application owner");

        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">Update failed</span>
            </div>
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
              {isSignatureError ? (
                <>
                  <p className="font-medium mb-2">
                    The update is not digitally signed.
                  </p>
                  <p>
                    This is expected for development builds. Click Install to
                    proceed anyway.
                  </p>
                </>
              ) : (
                updateStatus.error || "An error occurred while updating."
              )}
            </div>
            <div className="flex space-x-2">
              {isSignatureError ? (
                <Button
                  onClick={installUpdate}
                  variant="default"
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Anyway
                </Button>
              ) : (
                <Button
                  onClick={checkForUpdates}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Software Update</CardTitle>
        <CardDescription>
          {updateInfo?.currentVersion &&
            `Current version: v${updateInfo.currentVersion}`}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
      {updateStatus.status === "available" && (
        <CardFooter className="pt-0">
          <Button
            onClick={handleRemindLater}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <Clock className="h-4 w-4 mr-2" />
            Remind me in 24 hours
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
