"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Separator } from "./separator";
import {
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useUpdates } from "../../hooks/use-updates";

export function UpdateSettings() {
  const {
    updateStatus,
    updateInfo,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  } = useUpdates();
  const [isChecking, setIsChecking] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    await checkForUpdates();
    setIsChecking(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Software Updates</span>
          </CardTitle>
          <CardDescription>
            Keep your app up to date with the latest features and security patches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Version</p>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Software Updates</span>
        </CardTitle>
        <CardDescription>
          Keep your app up to date with the latest features and security patches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Version */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Version</p>
            <p className="text-sm text-muted-foreground">
              {updateInfo?.currentVersion
                ? `v${updateInfo.currentVersion}`
                : "Loading..."}
            </p>
          </div>
          <Button
            onClick={handleCheckForUpdates}
            disabled={isChecking || updateStatus.status === "downloading"}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            Check for Updates
          </Button>
        </div>

        <Separator />

        {/* Update Status */}
        {updateStatus.status !== "idle" &&
          updateStatus.status !== "not-available" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {updateStatus.status === "checking" && (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Checking for updates...</span>
                  </>
                )}
                {updateStatus.status === "available" && (
                  <>
                    <Badge variant="secondary">Update Available</Badge>
                    {updateInfo?.updateInfo?.version && (
                      <span className="text-sm text-muted-foreground">
                        v{updateInfo.updateInfo.version}
                      </span>
                    )}
                  </>
                )}
                {updateStatus.status === "downloading" && (
                  <>
                    <Download className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Downloading update...</span>
                  </>
                )}
                {updateStatus.status === "downloaded" && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      Update ready to install
                    </span>
                  </>
                )}
                {updateStatus.status === "error" && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Update failed</span>
                  </>
                )}
              </div>

              {/* Update Info */}
              {updateInfo?.updateInfo && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {updateInfo.updateInfo.version && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        New Version:
                      </span>
                      <span className="font-medium">
                        v{updateInfo.updateInfo.version}
                      </span>
                    </div>
                  )}
                  {updateInfo.updateInfo.files &&
                    updateInfo.updateInfo.files[0] && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Size:</span>
                        <span>
                          {formatBytes(updateInfo.updateInfo.files[0].size)}
                        </span>
                      </div>
                    )}
                  {updateInfo.updateInfo.releaseDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Release Date:
                      </span>
                      <span>
                        {new Date(
                          updateInfo.updateInfo.releaseDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {updateInfo.updateInfo.releaseNotes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Release Notes:
                      </span>
                      <p className="mt-1 text-xs">
                        {updateInfo.updateInfo.releaseNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Progress */}
              {updateStatus.status === "downloading" &&
                updateStatus.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Download Progress</span>
                      <span>{Math.round(updateStatus.progress.percent)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${updateStatus.progress.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {formatBytes(updateStatus.progress.transferred)}
                      </span>
                      <span>{formatBytes(updateStatus.progress.total)}</span>
                    </div>
                  </div>
                )}

              {/* Error Message */}
              {updateStatus.status === "error" && updateStatus.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{updateStatus.error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {updateStatus.status === "available" && (
                  <Button onClick={downloadUpdate} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Update
                  </Button>
                )}
                {updateStatus.status === "downloaded" && (
                  <Button onClick={installUpdate} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Install & Restart
                  </Button>
                )}
                {updateStatus.status === "error" && (
                  <Button
                    onClick={handleCheckForUpdates}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          )}

        {/* Auto-update Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Auto-update:</strong> The app automatically checks for
            updates when it starts. You can also manually check for updates
            using the button above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
 