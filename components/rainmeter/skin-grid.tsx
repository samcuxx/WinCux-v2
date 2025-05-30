import React from "react";
import { RainmeterSkin } from "@/types/rainmeter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Star,
  Eye,
  FileText,
  Calendar,
  User,
  Play,
  Settings,
  ExternalLink,
} from "lucide-react";

interface SkinGridProps {
  skins: RainmeterSkin[];
  viewMode: "grid" | "list";
  installedSkins: Set<string>;
  onSkinClick: (skin: RainmeterSkin) => void;
  onDownload: (skin: RainmeterSkin, e: React.MouseEvent) => void;
  onInstall: (skin: RainmeterSkin, e: React.MouseEvent) => void;
  onPreview: (skin: RainmeterSkin, e: React.MouseEvent) => void;
}

export function SkinGrid({
  skins,
  viewMode,
  installedSkins,
  onSkinClick,
  onDownload,
  onInstall,
  onPreview,
}: SkinGridProps) {
  const formatFileSize = (sizeStr: string): string => {
    if (!sizeStr) return "Unknown";
    return sizeStr;
  };

  const formatRating = (rating: number, votes: number): string => {
    if (rating === 0) return "No rating";
    return `${rating.toFixed(1)} (${votes} vote${votes !== 1 ? "s" : ""})`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "Unknown";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {skins.map((skin) => {
          const isInstalled = installedSkins.has(skin.id);

          return (
            <Card
              key={skin.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm"
              onClick={() => onSkinClick(skin)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                      {skin.thumbnail_url ? (
                        <img
                          src={skin.thumbnail_url}
                          alt={skin.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {skin.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {skin.description}
                        </p>

                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{skin.developer || "Unknown"}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{formatRating(skin.rating, skin.votes)}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>
                              {skin.downloads.toLocaleString()} downloads
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{formatFileSize(skin.file_size)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="secondary" className="text-xs">
                          {skin.category}
                        </Badge>

                        {isInstalled ? (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => onPreview(skin, e)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Enable
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => onPreview(skin, e)}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => onPreview(skin, e)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                              onClick={(e) => onInstall(skin, e)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Install
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {skins.map((skin) => {
        const isInstalled = installedSkins.has(skin.id);

        return (
          <Card
            key={skin.id}
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm overflow-hidden"
            onClick={() => onSkinClick(skin)}
          >
            <CardContent className="p-0">
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                {skin.thumbnail_url ? (
                  <img
                    src={skin.thumbnail_url}
                    alt={skin.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                {/* Category Badge */}
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 text-xs bg-white/90 dark:bg-gray-900/90"
                >
                  {skin.category}
                </Badge>

                {/* Install Status */}
                {isInstalled && (
                  <Badge
                    variant="default"
                    className="absolute top-2 right-2 text-xs bg-green-500 text-white"
                  >
                    Installed
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1 mb-2">
                  {skin.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {skin.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">
                        {skin.developer || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>{formatFileSize(skin.file_size)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{formatRating(skin.rating, skin.votes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{skin.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {skin.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {skin.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-2 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {skin.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{skin.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  {isInstalled ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => onPreview(skin, e)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Enable
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => onPreview(skin, e)}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => onPreview(skin, e)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                        onClick={(e) => onInstall(skin, e)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Install
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
