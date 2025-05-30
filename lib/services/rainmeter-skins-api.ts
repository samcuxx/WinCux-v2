import {
  RainmeterSkin,
  SkinSearchParams,
  SkinSearchResponse,
} from "@/types/rainmeter";

const SKINS_DATA_URL =
  "https://raw.githubusercontent.com/samcuxx/SkinsCux/refs/heads/main/data/rainmeter_skins.csv";

class RainmeterSkinsAPI {
  private cache: RainmeterSkin[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Parse CSV data into RainmeterSkin objects
   */
  private parseCSVData(csvData: string): RainmeterSkin[] {
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",");

    return lines
      .slice(1)
      .map((line, index) => {
        // Handle CSV parsing with potential commas in quoted fields
        const values = this.parseCSVLine(line);

        if (values.length < headers.length) {
          console.warn(`Skipping malformed line ${index + 2}:`, line);
          return null;
        }

        const skin: any = {};
        headers.forEach((header, i) => {
          const cleanHeader = header.trim().replace(/"/g, "");
          let value = values[i]?.trim().replace(/"/g, "") || "";

          switch (cleanHeader) {
            case "tags":
              skin.tags = value
                ? value.split(",").map((tag) => tag.trim())
                : [];
              break;
            case "rating":
              // Parse rating from "X.X by Y votes" format
              const ratingMatch = value.match(/^([\d.]+)/);
              skin.rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
              const votesMatch = value.match(/by (\d+) votes?/);
              skin.votes = votesMatch ? parseInt(votesMatch[1]) : 0;
              break;
            case "downloads":
              skin.downloads = parseInt(value) || 0;
              break;
            case "url":
              // Generate ID from URL
              skin.id = this.generateIdFromUrl(value);
              skin.url = value;
              break;
            default:
              skin[cleanHeader] = value;
          }
        });

        return skin;
      })
      .filter(Boolean) as RainmeterSkin[];
  }

  /**
   * Parse a CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Generate a unique ID from skin URL
   */
  private generateIdFromUrl(url: string): string {
    // Extract skin name from URL and create ID
    const match = url.match(/\/skin\/([^/]+)/);
    if (match) {
      return match[1];
    }

    // Fallback: use hash of URL
    return btoa(url)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 16);
  }

  /**
   * Fetch skins data from CSV source
   */
  private async fetchSkinsData(): Promise<RainmeterSkin[]> {
    try {
      const response = await fetch(SKINS_DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvData = await response.text();
      const skins = this.parseCSVData(csvData);

      console.log(`Loaded ${skins.length} Rainmeter skins from CSV`);
      return skins;
    } catch (error) {
      console.error("Failed to fetch skins data:", error);
      throw new Error("Failed to load Rainmeter skins data");
    }
  }

  /**
   * Get all skins with caching
   */
  private async getAllSkins(): Promise<RainmeterSkin[]> {
    const now = Date.now();

    // Return cached data if available and fresh
    if (this.cache && now - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cache;
    }

    // Fetch fresh data
    this.cache = await this.fetchSkinsData();
    this.cacheTimestamp = now;

    return this.cache;
  }

  /**
   * Search skins with filtering and pagination
   */
  async searchSkins(
    params: SkinSearchParams = {}
  ): Promise<SkinSearchResponse> {
    const {
      query = "",
      category = "",
      tags = [],
      developer = "",
      sorting = "rating",
      order = "desc",
      page = 1,
      limit = 24,
    } = params;

    try {
      const allSkins = await this.getAllSkins();
      let filteredSkins = [...allSkins];

      // Apply filters
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredSkins = filteredSkins.filter(
          (skin) =>
            skin.name.toLowerCase().includes(searchTerm) ||
            skin.description.toLowerCase().includes(searchTerm) ||
            skin.developer.toLowerCase().includes(searchTerm) ||
            skin.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
        );
      }

      if (category && category !== "All") {
        filteredSkins = filteredSkins.filter(
          (skin) => skin.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (tags.length > 0) {
        filteredSkins = filteredSkins.filter((skin) =>
          tags.some((tag) =>
            skin.tags.some((skinTag) =>
              skinTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }

      if (developer) {
        filteredSkins = filteredSkins.filter((skin) =>
          skin.developer.toLowerCase().includes(developer.toLowerCase())
        );
      }

      // Apply sorting
      filteredSkins.sort((a, b) => {
        let aVal: any, bVal: any;

        switch (sorting) {
          case "name":
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case "rating":
            aVal = a.rating;
            bVal = b.rating;
            break;
          case "downloads":
            aVal = a.downloads;
            bVal = b.downloads;
            break;
          case "last_updated":
            aVal = new Date(a.last_updated).getTime();
            bVal = new Date(b.last_updated).getTime();
            break;
          case "file_size":
            aVal = this.parseFileSize(a.file_size);
            bVal = this.parseFileSize(b.file_size);
            break;
          default:
            aVal = a.rating;
            bVal = b.rating;
        }

        if (order === "asc") {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });

      // Apply pagination
      const totalCount = filteredSkins.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedSkins = filteredSkins.slice(startIndex, endIndex);
      const hasNextPage = endIndex < totalCount;

      return {
        skins: paginatedSkins,
        totalCount,
        hasNextPage,
        page,
      };
    } catch (error) {
      console.error("Search failed:", error);
      throw error;
    }
  }

  /**
   * Parse file size string to bytes for sorting
   */
  private parseFileSize(sizeStr: string): number {
    if (!sizeStr) return 0;

    const match = sizeStr.match(/([\d.]+)\s*(KB|MB|GB)/i);
    if (!match) return 0;

    const size = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
      case "KB":
        return size * 1024;
      case "MB":
        return size * 1024 * 1024;
      case "GB":
        return size * 1024 * 1024 * 1024;
      default:
        return size;
    }
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const skins = await this.getAllSkins();
      const categories = [...new Set(skins.map((skin) => skin.category))]
        .filter(Boolean)
        .sort();

      return ["All", ...categories];
    } catch (error) {
      console.error("Failed to get categories:", error);
      return ["All"];
    }
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 20): Promise<string[]> {
    try {
      const skins = await this.getAllSkins();
      const tagCounts: Record<string, number> = {};

      skins.forEach((skin) => {
        skin.tags.forEach((tag) => {
          const cleanTag = tag.trim().toLowerCase();
          if (cleanTag) {
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        });
      });

      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag]) => tag);
    } catch (error) {
      console.error("Failed to get popular tags:", error);
      return [];
    }
  }

  /**
   * Get skin by ID
   */
  async getSkinById(id: string): Promise<RainmeterSkin | null> {
    try {
      const skins = await this.getAllSkins();
      return skins.find((skin) => skin.id === id) || null;
    } catch (error) {
      console.error("Failed to get skin by ID:", error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      isCached: !!this.cache,
      cacheAge: this.cache ? Date.now() - this.cacheTimestamp : 0,
      cacheSize: this.cache ? this.cache.length : 0,
      lastFetched: this.cacheTimestamp ? new Date(this.cacheTimestamp) : null,
    };
  }
}

export const rainmeterSkinsAPI = new RainmeterSkinsAPI();
