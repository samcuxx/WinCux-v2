import { NextRequest, NextResponse } from "next/server";
import { WALLHAVEN_CONFIG } from "@/lib/config/wallhaven";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Build the Wallhaven API URL
    const wallhavenUrl = `${WALLHAVEN_CONFIG.BASE_URL}${WALLHAVEN_CONFIG.ENDPOINTS.SETTINGS}?apikey=${WALLHAVEN_CONFIG.API_KEY}`;

    // Make the request to Wallhaven API
    const response = await fetch(wallhavenUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "WallpaperApp/1.0",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data with proper headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Wallhaven settings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
