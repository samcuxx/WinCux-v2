"use client";

import React from "react";
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
import { Download, RefreshCw, CheckCircle, AlertCircle, X } from "lucide-react";
import { useUpdates } from "../../hooks/use-updates";

interface UpdateNotificationProps {
  onClose?: () => void;
}

export function UpdateNotification({ onClose }: UpdateNotificationProps) {
  const {
    updateStatus,
    updateInfo,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  } = useUpdates();

  if (
    updateStatus.status === "idle" ||
    updateStatus.status === "not-available"
  ) {
    return null;
  }

  const renderContent = () => {
    switch (updateStatus.status) {
      case "checking":
        return (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking for updates...</span>
          </div>
        );

      case "available":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">New Version Available</Badge>
                {updateInfo?.updateInfo?.version && (
                  <span className="text-sm text-muted-foreground">
                    v{updateInfo.updateInfo.version}
                  </span>
                )}
              </div>
            </div>
            {updateInfo?.updateInfo?.releaseNotes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">What&apos;s new:</p>
                <p className="text-xs">{updateInfo.updateInfo.releaseNotes}</p>
              </div>
            )}
            <Button onClick={downloadUpdate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Update
            </Button>
          </div>
        );

      case "downloading":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Downloading update...</span>
              {updateStatus.progress && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(updateStatus.progress.percent)}%
                </span>
              )}
            </div>
            {updateStatus.progress && (
              <Progress
                value={updateStatus.progress.percent}
                className="w-full"
              />
            )}
            <div className="text-xs text-muted-foreground">
              {updateStatus.progress && (
                <span>
                  {Math.round(updateStatus.progress.transferred / 1024 / 1024)}
                  MB /{Math.round(updateStatus.progress.total / 1024 / 1024)}MB
                </span>
              )}
            </div>
          </div>
        );

      case "downloaded":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                Update downloaded successfully!
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              The update is ready to install. The app will restart to apply the
              update.
            </p>
            <Button onClick={installUpdate} className="w-full">
              Install & Restart
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Update failed</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {updateStatus.error || "An error occurred while updating."}
            </p>
            <div className="flex space-x-2">
              <Button onClick={checkForUpdates} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
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
    <Card className="w-full max-w-md">
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
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Remind me later
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
