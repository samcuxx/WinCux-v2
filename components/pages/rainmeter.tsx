"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Plus,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function RainmeterPage() {
  const [rainmeterStatus, setRainmeterStatus] = useState<
    "checking" | "installed" | "not_installed"
  >("checking");
  const [installationState, setInstallationState] = useState<
    "idle" | "installing" | "success" | "error"
  >("idle");
  const [installProgress, setInstallProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if Rainmeter is installed when component mounts
  useEffect(() => {
    checkRainmeterInstallation();
  }, []);

  // Function to check if Rainmeter is installed
  const checkRainmeterInstallation = async () => {
    setRainmeterStatus("checking");
    try {
      if (typeof window.electronAPI !== "undefined") {
        // Create a channel to receive response from the checkRainmeterInstalled handler
        const checkListener = (_event: any, result: any) => {
          setRainmeterStatus(result.installed ? "installed" : "not_installed");
        };

        window.electronAPI.on("rainmeter-check-result", checkListener);

        // Send request to check Rainmeter installation
        window.electronAPI.send("check-rainmeter-installation", {});

        // Return cleanup function to remove the listener
        return () => {
          window.electronAPI.removeListener(
            "rainmeter-check-result",
            checkListener
          );
        };
      } else {
        // Fallback for development without Electron
        console.warn("electronAPI not available, using mock detection");
        // Simulate a check (replace with actual implementation)
        setTimeout(() => {
          setRainmeterStatus("not_installed");
        }, 1000);
      }
    } catch (error) {
      console.error("Error checking Rainmeter installation:", error);
      setRainmeterStatus("not_installed");
    }
  };

  // Function to install Rainmeter via winget
  const installRainmeter = async () => {
    setInstallationState("installing");
    setInstallProgress(0);
    setErrorMessage(null);

    try {
      if (typeof window.electronAPI !== "undefined") {
        // Set up listeners for installation progress and results
        const progressListener = (_event: any, data: { progress: number }) => {
          setInstallProgress(data.progress);
        };

        const resultListener = (
          _event: any,
          result: { success: boolean; error?: string }
        ) => {
          if (result.success) {
            setInstallationState("success");
            setRainmeterStatus("installed");
          } else {
            setInstallationState("error");
            setErrorMessage(result.error || "Installation failed");
          }
        };

        window.electronAPI.on("rainmeter-install-progress", progressListener);
        window.electronAPI.on("rainmeter-install-result", resultListener);

        // Send request to install Rainmeter
        window.electronAPI.send("install-rainmeter", {});

        // Return cleanup function to remove listeners
        return () => {
          window.electronAPI.removeListener(
            "rainmeter-install-progress",
            progressListener
          );
          window.electronAPI.removeListener(
            "rainmeter-install-result",
            resultListener
          );
        };
      } else {
        // Fallback for development without Electron
        console.warn("electronAPI not available, using mock installation");
        // Simulate installation progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setInstallProgress(progress);

          if (progress >= 100) {
            clearInterval(interval);
            setInstallationState("success");
            setRainmeterStatus("installed");
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error installing Rainmeter:", error);
      setInstallationState("error");
      setErrorMessage("Failed to start installation process");
    }
  };

  // Function to retry installation
  const retryInstallation = () => {
    setInstallationState("idle");
    setErrorMessage(null);
    installRainmeter();
  };

  // Function to render installation status
  const renderInstallationStatus = () => {
    switch (installationState) {
      case "installing":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
              <span>Installing Rainmeter...</span>
            </div>
            <Progress value={installProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              This may take a few minutes. Please don&apos;t close the
              application.
            </p>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center space-x-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Installation successful! Rainmeter is now ready to use.</span>
          </div>
        );
      case "error":
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Installation Failed</AlertTitle>
            <AlertDescription>
              {errorMessage || "There was an error installing Rainmeter."}
              <Button
                variant="outline"
                size="sm"
                onClick={retryInstallation}
                className="mt-2"
              >
                Retry Installation
              </Button>
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Rainmeter Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize your desktop with powerful widgets and monitoring tools
          </p>
        </div>
        {rainmeterStatus === "installed" ? (
          <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Check for Updates
          </Button>
        ) : (
          <Button
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            onClick={checkRainmeterInstallation}
            disabled={rainmeterStatus === "checking"}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                rainmeterStatus === "checking" ? "animate-spin" : ""
              }`}
            />
            Refresh Status
          </Button>
        )}
      </div>

      {/* Installation Status */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {rainmeterStatus === "checking" ? (
              <>
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Checking Rainmeter Installation...</span>
              </>
            ) : rainmeterStatus === "installed" ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Rainmeter Detected</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Rainmeter Not Detected</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {rainmeterStatus === "checking"
              ? "Checking if Rainmeter is installed on your system..."
              : rainmeterStatus === "installed"
              ? "Rainmeter is installed and ready to use. You can now install and manage skins."
              : "Rainmeter is not installed on your system. Click the button below to install it automatically using winget."}
          </CardDescription>
        </CardHeader>

        {rainmeterStatus === "not_installed" &&
          installationState === "idle" && (
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={installRainmeter}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install via winget
                </Button>
                <div className="text-sm text-muted-foreground">
                  Command:{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    winget install Rainmeter
                  </code>
                </div>
              </div>
            </CardContent>
          )}

        {installationState !== "idle" && (
          <CardContent>{renderInstallationStatus()}</CardContent>
        )}
      </Card>

      {/* System Monitoring */}
      {rainmeterStatus === "installed" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <Cpu className="w-4 h-4" />
                <span>CPU Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">45%</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <MemoryStick className="w-4 h-4" />
                <span>Memory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">8.2 GB</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <HardDrive className="w-4 h-4" />
                <span>Storage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">256 GB</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                  style={{ width: "82%" }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Skin Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Available Skins</h3>
          <Button
            variant="outline"
            size="sm"
            disabled={rainmeterStatus !== "installed"}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Skin
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className={`border-0 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                rainmeterStatus === "installed"
                  ? "bg-white/60 dark:bg-gray-950/60"
                  : "bg-white/30 dark:bg-gray-950/30 opacity-60"
              }`}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-green-200 to-blue-200 dark:from-green-800 dark:to-blue-800 rounded-lg mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-white/70" />
                  </div>
                </div>
                <h3 className="font-semibold mb-1">Skin Package {i + 1}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  System monitoring skin with modern design
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {rainmeterStatus === "installed"
                      ? "Ready"
                      : "Requires Rainmeter"}
                  </Badge>
                  <Button
                    size="sm"
                    disabled={rainmeterStatus !== "installed"}
                    className="bg-gradient-to-r from-green-500 to-blue-500"
                  >
                    {rainmeterStatus === "installed"
                      ? "Install"
                      : "Unavailable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
