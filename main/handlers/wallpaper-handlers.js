const { ipcMain } = require("electron");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");
const { createHash } = require("crypto");
const sharp = require("sharp");

// Constants for thumbnail generation
const THUMBNAIL_WIDTH = 320;
const THUMBNAIL_HEIGHT = 180;
const THUMBNAIL_QUALITY = 80;

// Cache management constants
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

function setupWallpaperHandlers() {
  // Ensure thumbnail cache directory exists
  const ensureThumbnailCacheDir = () => {
    const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");
    const cachePath = path.join(picturesPath, ".thumbnails");

    if (!fs.existsSync(picturesPath)) {
      fs.mkdirSync(picturesPath, { recursive: true });
    }

    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });

      // Set hidden attribute on Windows
      if (process.platform === "win32") {
        try {
          const { execSync } = require("child_process");
          execSync(`attrib +h "${cachePath}"`);
          console.log("Set hidden attribute on thumbnails folder");
        } catch (error) {
          console.error("Failed to set hidden attribute:", error);
        }
      }
    }

    return cachePath;
  };

  // Generate a cache key for a wallpaper
  const generateCacheKey = (filename) => {
    return createHash("md5").update(filename).digest("hex");
  };

  // Generate thumbnail for a wallpaper
  const generateThumbnail = async (filePath, cacheKey) => {
    const cachePath = ensureThumbnailCacheDir();
    const thumbnailPath = path.join(cachePath, `${cacheKey}.webp`);

    try {
      await sharp(filePath)
        .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: THUMBNAIL_QUALITY })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error(`Error generating thumbnail for ${filePath}:`, error);
      throw error;
    }
  };

  // Clean up old thumbnails
  const cleanupOldThumbnails = () => {
    try {
      const cachePath = ensureThumbnailCacheDir();
      const now = Date.now();

      const files = fs.readdirSync(cachePath);

      files.forEach((file) => {
        const filePath = path.join(cachePath, file);
        const stats = fs.statSync(filePath);

        // Delete thumbnails older than CACHE_MAX_AGE
        if (now - stats.mtimeMs > CACHE_MAX_AGE) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old thumbnail: ${filePath}`);
        }
      });
    } catch (error) {
      console.error("Error cleaning up old thumbnails:", error);
    }
  };

  // Run cleanup on startup
  cleanupOldThumbnails();

  // Schedule periodic cleanup (every 24 hours)
  setInterval(cleanupOldThumbnails, 24 * 60 * 60 * 1000);

  // Download wallpaper functionality
  ipcMain.handle("download-wallpaper", async (event, { url, filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");

      // Create Wallpapers folder if it doesn't exist
      if (!fs.existsSync(picturesPath)) {
        fs.mkdirSync(picturesPath, { recursive: true });
      }

      const filePath = path.join(picturesPath, filename);

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        console.log("Wallpaper already exists:", filePath);
        return { success: true, path: filePath, alreadyExists: true };
      }

      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        console.log("Downloading wallpaper from:", url);
        console.log("Saving to:", filePath);

        https
          .get(url, (response) => {
            // Check if response is successful
            if (response.statusCode !== 200) {
              reject({
                success: false,
                error: `HTTP ${response.statusCode}: ${response.statusMessage}`,
              });
              return;
            }

            response.pipe(file);

            file.on("finish", () => {
              file.close();
              console.log("Download completed:", filePath);
              resolve({ success: true, path: filePath, alreadyExists: false });
            });

            file.on("error", (err) => {
              fs.unlink(filePath, () => {}); // Delete the file on error
              console.error("File write error:", err);
              reject({ success: false, error: err.message });
            });
          })
          .on("error", (err) => {
            console.error("Download error:", err);
            reject({ success: false, error: err.message });
          });
      });
    } catch (error) {
      console.error("Download function error:", error);
      return { success: false, error: error.message };
    }
  });

  // Check if wallpaper file exists
  ipcMain.handle("check-wallpaper-exists", async (event, { filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");
      const filePath = path.join(picturesPath, filename);

      const exists = fs.existsSync(filePath);
      return { exists, path: exists ? filePath : null };
    } catch (error) {
      return { exists: false, path: null, error: error.message };
    }
  });

  // Get local wallpaper as base64 data URL
  ipcMain.handle("get-local-wallpaper", async (event, { filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");
      const filePath = path.join(picturesPath, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { success: false, error: "File not found" };
      }

      // Read the file as binary data
      const fileBuffer = fs.readFileSync(filePath);

      // Determine the MIME type based on file extension
      const ext = filename.toLowerCase().split(".").pop();
      let mimeType = "image/jpeg"; // default

      switch (ext) {
        case "png":
          mimeType = "image/png";
          break;
        case "webp":
          mimeType = "image/webp";
          break;
        case "gif":
          mimeType = "image/gif";
          break;
        case "bmp":
          mimeType = "image/bmp";
          break;
        case "jpg":
        case "jpeg":
        default:
          mimeType = "image/jpeg";
          break;
      }

      // Convert to base64 data URL
      const base64Data = fileBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return {
        success: true,
        dataUrl: dataUrl,
        path: filePath,
        size: fileBuffer.length,
      };
    } catch (error) {
      console.error("Error reading local wallpaper:", error);
      return { success: false, error: error.message };
    }
  });

  // Get local wallpaper thumbnail (optimized for grid view)
  ipcMain.handle(
    "get-local-wallpaper-thumbnail",
    async (event, { filename }) => {
      try {
        const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");
        const filePath = path.join(picturesPath, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return { success: false, error: "File not found" };
        }

        // Generate cache key
        const cacheKey = generateCacheKey(filename);
        const cachePath = ensureThumbnailCacheDir();
        const thumbnailPath = path.join(cachePath, `${cacheKey}.webp`);

        // Check if thumbnail already exists in cache
        if (fs.existsSync(thumbnailPath)) {
          // Update access time to prevent premature deletion
          fs.utimesSync(thumbnailPath, new Date(), new Date());

          // Read the thumbnail file
          const thumbnailBuffer = fs.readFileSync(thumbnailPath);
          const thumbnailBase64 = thumbnailBuffer.toString("base64");
          const thumbnailUrl = `data:image/webp;base64,${thumbnailBase64}`;

          return {
            success: true,
            thumbnailUrl,
            path: filePath,
            fromCache: true,
          };
        }

        // Generate thumbnail if not in cache
        try {
          await generateThumbnail(filePath, cacheKey);

          // Read the newly generated thumbnail
          const thumbnailBuffer = fs.readFileSync(thumbnailPath);
          const thumbnailBase64 = thumbnailBuffer.toString("base64");
          const thumbnailUrl = `data:image/webp;base64,${thumbnailBase64}`;

          return {
            success: true,
            thumbnailUrl,
            path: filePath,
            fromCache: false,
          };
        } catch (error) {
          console.error("Error generating thumbnail:", error);

          // Fallback to full image if thumbnail generation fails
          const fileBuffer = fs.readFileSync(filePath);
          const ext = filename.toLowerCase().split(".").pop();
          let mimeType = "image/jpeg"; // default

          switch (ext) {
            case "png":
              mimeType = "image/png";
              break;
            case "webp":
              mimeType = "image/webp";
              break;
            case "gif":
              mimeType = "image/gif";
              break;
            case "bmp":
              mimeType = "image/bmp";
              break;
            case "jpg":
            case "jpeg":
            default:
              mimeType = "image/jpeg";
              break;
          }

          const base64Data = fileBuffer.toString("base64");
          const dataUrl = `data:${mimeType};base64,${base64Data}`;

          return {
            success: true,
            thumbnailUrl: dataUrl,
            path: filePath,
            size: fileBuffer.length,
            fromCache: false,
            fallback: true,
          };
        }
      } catch (error) {
        console.error("Error creating thumbnail:", error);
        return { success: false, error: error.message };
      }
    }
  );

  // Verify and regenerate thumbnails for all wallpapers
  ipcMain.handle("verify-wallpaper-thumbnails", async () => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");
      const cachePath = ensureThumbnailCacheDir();

      // Create Wallpapers folder if it doesn't exist
      if (!fs.existsSync(picturesPath)) {
        fs.mkdirSync(picturesPath, { recursive: true });
        return { success: true, processed: 0, generated: 0 };
      }

      const files = fs.readdirSync(picturesPath);
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".gif",
        ".webp",
      ];

      let processed = 0;
      let generated = 0;

      for (const file of files) {
        // Skip the thumbnails directory itself
        if (file === ".thumbnails") continue;

        const filePath = path.join(picturesPath, file);
        const ext = path.extname(file).toLowerCase();

        // Check if it's an image file
        if (imageExtensions.includes(ext)) {
          processed++;

          // Generate cache key
          const cacheKey = generateCacheKey(file);
          const thumbnailPath = path.join(cachePath, `${cacheKey}.webp`);

          // Generate thumbnail if it doesn't exist
          if (!fs.existsSync(thumbnailPath)) {
            try {
              await generateThumbnail(filePath, cacheKey);
              generated++;
            } catch (error) {
              console.error(`Error generating thumbnail for ${file}:`, error);
            }
          }
        }
      }

      return {
        success: true,
        processed,
        generated,
        cachePath,
      };
    } catch (error) {
      console.error("Error verifying thumbnails:", error);
      return { success: false, error: error.message };
    }
  });

  // Delete local wallpaper
  ipcMain.handle("delete-local-wallpaper", async (event, { filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");
      const filePath = path.join(picturesPath, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { success: false, error: "File not found" };
      }

      // Delete the file
      fs.unlinkSync(filePath);

      // Also delete the thumbnail if it exists
      try {
        const cacheKey = generateCacheKey(filename);
        const cachePath = ensureThumbnailCacheDir();
        const thumbnailPath = path.join(cachePath, `${cacheKey}.webp`);

        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      } catch (thumbnailError) {
        console.warn("Error deleting thumbnail:", thumbnailError);
        // Continue even if thumbnail deletion fails
      }

      console.log("Successfully deleted wallpaper:", filePath);
      return { success: true, path: filePath };
    } catch (error) {
      console.error("Error deleting wallpaper:", error);
      return { success: false, error: error.message };
    }
  });

  // Set wallpaper functionality
  ipcMain.handle("set-wallpaper", async (event, { url, filename }) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");

      // Create Wallpapers folder if it doesn't exist
      if (!fs.existsSync(picturesPath)) {
        fs.mkdirSync(picturesPath, { recursive: true });
      }

      const filePath = path.join(picturesPath, filename);

      // Check if file already exists
      if (!fs.existsSync(filePath)) {
        console.log("Wallpaper not found locally, downloading...");
        // Download the image only if it doesn't exist
        await new Promise((resolve, reject) => {
          const file = fs.createWriteStream(filePath);

          console.log("Downloading wallpaper from:", url);
          console.log("Saving to:", filePath);

          https
            .get(url, (response) => {
              // Check if response is successful
              if (response.statusCode !== 200) {
                reject(
                  new Error(
                    `HTTP ${response.statusCode}: ${response.statusMessage}`
                  )
                );
                return;
              }

              response.pipe(file);

              file.on("finish", () => {
                file.close();
                console.log(
                  "Download completed for wallpaper setting:",
                  filePath
                );
                resolve();
              });

              file.on("error", (err) => {
                fs.unlink(filePath, () => {});
                console.error(
                  "File write error during wallpaper setting:",
                  err
                );
                reject(err);
              });
            })
            .on("error", (err) => {
              console.error("Download error during wallpaper setting:", err);
              reject(err);
            });
        });
      } else {
        console.log("Using existing wallpaper file:", filePath);
      }

      // Set as wallpaper based on platform
      if (process.platform === "win32") {
        // Validate that the file exists and is a supported format
        if (!fs.existsSync(filePath)) {
          return { success: false, error: "Downloaded file not found" };
        }

        // Ensure we have the absolute path
        const absolutePath = path.resolve(filePath);
        console.log("Absolute file path:", absolutePath);

        // Check file size to ensure it's not corrupted
        const stats = fs.statSync(absolutePath);
        if (stats.size < 1000) {
          // Less than 1KB is probably corrupted
          return {
            success: false,
            error: "Downloaded file appears to be corrupted",
          };
        }

        // Use a simpler PowerShell approach that's more reliable
        const escapedPath = absolutePath.replace(/'/g, "''");
        const command = `powershell.exe -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Wallpaper { [DllImport(\\"user32.dll\\", CharSet=CharSet.Auto)] static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); public static void SetWallpaper(string path) { SystemParametersInfo(20, 0, path, 3); } }'; [Wallpaper]::SetWallpaper('${escapedPath}')"`;

        console.log("Setting wallpaper with command:", command);
        console.log("File path:", absolutePath);
        console.log("File size:", stats.size, "bytes");

        return new Promise((resolve, reject) => {
          exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
            console.log("PowerShell stdout:", stdout);
            console.log("PowerShell stderr:", stderr);

            if (error) {
              console.error("PowerShell error:", error);

              // Fallback: Try using registry method
              const registryCommand = `powershell.exe -Command "Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name Wallpaper -Value '${escapedPath}'; rundll32.exe user32.dll,UpdatePerUserSystemParameters"`;

              console.log("Trying registry fallback:", registryCommand);

              exec(
                registryCommand,
                { timeout: 10000 },
                (fallbackError, fallbackStdout, fallbackStderr) => {
                  if (fallbackError) {
                    console.error("Registry fallback error:", fallbackError);

                    // Second fallback: Try using a different approach with RUNDLL32
                    const rundllCommand = `rundll32.exe user32.dll,SystemParametersInfoA 20 0 "${absolutePath}" 3`;

                    console.log("Trying rundll32 fallback:", rundllCommand);

                    exec(rundllCommand, { timeout: 10000 }, (rundllError) => {
                      if (rundllError) {
                        console.error("Rundll32 fallback error:", rundllError);
                        reject({
                          success: false,
                          error: `All wallpaper methods failed. Last error: ${rundllError.message}`,
                        });
                      } else {
                        console.log("Rundll32 method successful");
                        resolve({
                          success: true,
                          path: absolutePath,
                          method: "rundll32",
                        });
                      }
                    });
                  } else {
                    console.log("Registry method successful");
                    resolve({
                      success: true,
                      path: absolutePath,
                      method: "registry",
                    });
                  }
                }
              );
            } else {
              console.log("SystemParametersInfo method successful");
              resolve({
                success: true,
                path: absolutePath,
                method: "systemparametersinfo",
              });
            }
          });
        });
      } else if (process.platform === "darwin") {
        const command = `osascript -e "tell application \\"Finder\\" to set desktop picture to POSIX file \\"${filePath}\\""`;

        return new Promise((resolve, reject) => {
          exec(command, (error) => {
            if (error) {
              reject({ success: false, error: error.message });
            } else {
              resolve({ success: true, path: filePath });
            }
          });
        });
      } else {
        // Linux
        const command = `gsettings set org.gnome.desktop.background picture-uri "file://${filePath}"`;

        return new Promise((resolve, reject) => {
          exec(command, (error) => {
            if (error) {
              reject({ success: false, error: error.message });
            } else {
              resolve({ success: true, path: filePath });
            }
          });
        });
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // List all local wallpapers
  ipcMain.handle("list-local-wallpapers", async (event) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");

      // Create Wallpapers folder if it doesn't exist
      if (!fs.existsSync(picturesPath)) {
        fs.mkdirSync(picturesPath, { recursive: true });
        return { success: true, wallpapers: [] };
      }

      const files = fs.readdirSync(picturesPath);
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".gif",
        ".webp",
      ];
      const wallpapers = [];

      for (const file of files) {
        const filePath = path.join(picturesPath, file);
        const ext = path.extname(file).toLowerCase();

        // Check if it's an image file
        if (imageExtensions.includes(ext)) {
          try {
            const stats = fs.statSync(filePath);

            // Get image dimensions (basic width/height detection)
            let resolution = "Unknown";
            try {
              // For now, we'll set a default resolution, but this could be enhanced
              // with an image library like sharp or jimp to get actual dimensions
              resolution = "1920x1080"; // Default assumption
            } catch (err) {
              console.warn("Could not determine image dimensions for:", file);
            }

            // Create a wallpaper object compatible with LocalWallpaper interface
            const wallpaper = {
              id: `local_${file.replace(/\.[^/.]+$/, "")}`, // Remove extension for ID
              title: file.replace(/\.[^/.]+$/, ""), // Filename without extension
              description: `Local wallpaper: ${file}`,
              category: "general",
              resolution: resolution,
              size: `${(stats.size / 1024 / 1024).toFixed(1)} MB`,
              downloads: 1,
              rating: 5.0,
              tags: ["local", "downloaded"],
              author: "Local",
              dateAdded: stats.birthtime.toISOString(),
              colors: ["#000000", "#ffffff"],
              thumbnail: filePath,
              preview: filePath,
              fullRes: filePath,
              source: "local",
              sourceId: file.replace(/\.[^/.]+$/, ""),
              purity: "sfw",
              views: 0,
              favorites: 0,
              // Extended properties for downloads page
              filename: file,
              path: filePath,
              file_size: stats.size,
              // Legacy properties for compatibility
              url: filePath,
              short_url: filePath,
              dimension_x: 1920,
              dimension_y: 1080,
              ratio: "16:9",
              file_type: ext.substring(1),
              created_at: stats.birthtime.toISOString(),
              thumbs: {
                large: filePath,
                original: filePath,
                small: filePath,
              },
            };

            wallpapers.push(wallpaper);
          } catch (err) {
            console.warn("Error processing file:", file, err.message);
          }
        }
      }

      // Sort by creation date (newest first)
      wallpapers.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log(
        `Found ${wallpapers.length} local wallpapers in ${picturesPath}`
      );
      return { success: true, wallpapers };
    } catch (error) {
      console.error("Error listing local wallpapers:", error);
      return { success: false, error: error.message, wallpapers: [] };
    }
  });

  // Open wallpapers folder
  ipcMain.handle("open-wallpapers-folder", async (event) => {
    try {
      const picturesPath = path.join(os.homedir(), "Pictures", "Wallpapers");

      // Create folder if it doesn't exist
      if (!fs.existsSync(picturesPath)) {
        fs.mkdirSync(picturesPath, { recursive: true });
      }

      // Open folder based on platform
      if (process.platform === "win32") {
        exec(`explorer.exe "${picturesPath}"`);
      } else if (process.platform === "darwin") {
        exec(`open "${picturesPath}"`);
      } else {
        exec(`xdg-open "${picturesPath}"`);
      }

      return { success: true, path: picturesPath };
    } catch (error) {
      console.error("Error opening wallpapers folder:", error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupWallpaperHandlers };
