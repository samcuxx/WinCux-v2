import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Validate filename to prevent directory traversal
    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Construct the full path to the wallpaper file
    const wallpapersDir = path.join(os.homedir(), "Pictures", "Wallpapers");
    const filePath = path.join(wallpapersDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
    }

    // Return the file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving local wallpaper:", error);
    return NextResponse.json(
      { error: "Failed to serve wallpaper file" },
      { status: 500 }
    );
  }
}
