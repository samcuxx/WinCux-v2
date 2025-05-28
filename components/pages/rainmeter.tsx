"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Plus,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
} from "lucide-react";

export function RainmeterPage() {
  const [rainmeterInstalled, setRainmeterInstalled] = useState(false);

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
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Download className="w-4 h-4 mr-2" />
          {rainmeterInstalled ? "Update Rainmeter" : "Install Rainmeter"}
        </Button>
      </div>

      {/* Installation Status */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                rainmeterInstalled ? "bg-green-500" : "bg-orange-500"
              }`}
            ></div>
            <span>
              {rainmeterInstalled
                ? "Rainmeter Detected"
                : "Rainmeter Not Detected"}
            </span>
          </CardTitle>
          <CardDescription>
            {rainmeterInstalled
              ? "Rainmeter is installed and ready to use. You can now install and manage skins."
              : "Rainmeter is not installed on your system. Click the button below to install it automatically using winget."}
          </CardDescription>
        </CardHeader>
        {!rainmeterInstalled && (
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={() => setRainmeterInstalled(true)}
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
      </Card>

      {/* System Monitoring */}
      {rainmeterInstalled && (
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
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Skin
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className={`border-0 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                rainmeterInstalled
                  ? "bg-white/60 dark:bg-gray-950/60"
                  : "bg-white/30 dark:bg-gray-950/30 opacity-60"
              }`}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-green-200 to-blue-200 dark:from-green-800 to-blue-800 rounded-lg mb-3 relative overflow-hidden">
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
                    {rainmeterInstalled ? "Ready" : "Requires Rainmeter"}
                  </Badge>
                  <Button
                    size="sm"
                    disabled={!rainmeterInstalled}
                    className="bg-gradient-to-r from-green-500 to-blue-500"
                  >
                    {rainmeterInstalled ? "Install" : "Unavailable"}
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
