import React, { useState } from "react";
import { RainmeterSkin } from "@/types/rainmeter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Package,
  Tag,
  BarChart3,
  Clock,
  X,
} from "lucide-react";

interface SkinModalProps {
  skin: RainmeterSkin | null;
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  onDownload: (skin: RainmeterSkin) => void;
  onInstall: (skin: RainmeterSkin) => void;
  onEnable: (skin: RainmeterSkin) => void;
  onConfigure: (skin: RainmeterSkin) => void;
}

export function SkinModal({
  skin,
  isOpen,
  onClose,
  isInstalled,
  onDownload,
  onInstall,
  onEnable,
  onConfigure,
}: SkinModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!skin) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold line-clamp-2 mb-2">
                  {skin.name}
                </DialogTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{skin.developer || "Unknown Developer"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{formatRating(skin.rating, skin.votes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{skin.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{skin.category}</Badge>
                {isInstalled && (
                  <Badge variant="default" className="bg-green-500 text-white">
                    Installed
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full"
            >
              <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tags">Tags & Info</TabsTrigger>
              </TabsList>

              <div className="p-6 pt-4">
                <TabsContent value="overview" className="space-y-6">
                  {/* Preview Image */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                    {skin.thumbnail_url ? (
                      <img
                        src={skin.thumbnail_url}
                        alt={skin.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {skin.description || "No description available."}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <FileText className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <div className="text-sm font-medium">
                        {formatFileSize(skin.file_size)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        File Size
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                      <div className="text-sm font-medium">
                        {skin.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rating
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <Download className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <div className="text-sm font-medium">
                        {skin.downloads.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Downloads
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <Calendar className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                      <div className="text-sm font-medium">
                        {formatDate(skin.last_updated)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Developer</h4>
                        <p className="text-sm text-muted-foreground">
                          {skin.developer || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Category</h4>
                        <p className="text-sm text-muted-foreground">
                          {skin.category}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Version</h4>
                        <p className="text-sm text-muted-foreground">
                          {skin.version || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Last Updated</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(skin.last_updated)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Download URL</h4>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {skin.download_url}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(skin.download_url, "_blank")
                          }
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Source Page</h4>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {skin.url}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(skin.url, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tags" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    {skin.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skin.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tags available</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Technical Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Content Hash:</span>
                        <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                          {skin.content_hash}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Scraped At:</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {formatDate(skin.scraped_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(skin.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Source
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>

                {isInstalled ? (
                  <>
                    <Button variant="outline" onClick={() => onConfigure(skin)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0"
                      onClick={() => onEnable(skin)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Enable Skin
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => onDownload(skin)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                      onClick={() => onInstall(skin)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Install Skin
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
