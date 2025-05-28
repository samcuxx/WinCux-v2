"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Gauge, ArrowRight, Sparkles } from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Desktop Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your desktop with beautiful wallpapers and powerful
            Rainmeter skins. Simple, elegant, professional.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Image className="w-5 h-5 mr-3" />
            Browse Wallpapers
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-400 px-8 py-6 text-lg font-semibold transition-all duration-300"
          >
            <Gauge className="w-5 h-5 mr-3" />
            Explore Skins
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
        <Card className="group border-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-950/80 transition-all duration-300 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Image className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Wallpaper Gallery
                </h3>
                <p className="text-muted-foreground">
                  5,000+ curated wallpapers
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Discover stunning 4K wallpapers across multiple categories. From
              nature to abstract, find the perfect backdrop for your workspace.
            </p>
            <Button
              variant="ghost"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0 h-auto font-semibold"
            >
              Explore Gallery
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="group border-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-950/80 transition-all duration-300  overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                <Gauge className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Rainmeter Skins
                </h3>
                <p className="text-muted-foreground">
                  2,400+ monitoring widgets
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              Enhance your desktop with beautiful system monitoring widgets.
              Track performance, weather, and more with style.
            </p>
            <Button
              variant="ghost"
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-0 h-auto font-semibold"
            >
              View Skins
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Simple Stats */}
      <div className="flex items-center justify-center space-x-12 pt-8">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            5,000+
          </div>
          <div className="text-sm text-muted-foreground">Wallpapers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            2,400+
          </div>
          <div className="text-sm text-muted-foreground">Skins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            150K+
          </div>
          <div className="text-sm text-muted-foreground">Users</div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">Get started in seconds</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
