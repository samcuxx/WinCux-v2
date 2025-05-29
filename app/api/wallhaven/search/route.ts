import { NextRequest, NextResponse } from "next/server";
import { WALLHAVEN_CONFIG } from "@/lib/config/wallhaven";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get all search parameters
    const params = new URLSearchParams();

    // Add all query parameters from the request
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // Ensure API key is included
    if (!params.has("apikey")) {
      params.append("apikey", WALLHAVEN_CONFIG.API_KEY);
    }

    // Build the Wallhaven API URL
    const wallhavenUrl = `${WALLHAVEN_CONFIG.BASE_URL}${
      WALLHAVEN_CONFIG.ENDPOINTS.SEARCH
    }?${params.toString()}`;

    console.log("Making request to Wallhaven API:", wallhavenUrl);

    // Make the request to Wallhaven API
    const response = await fetch(wallhavenUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "WallpaperApp/1.0",
      },
    });

    console.log("Wallhaven API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Wallhaven API error response:", errorData);
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
    console.log(
      "Wallhaven API success, returned",
      data?.data?.length || 0,
      "wallpapers"
    );

    // Return the data with proper headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Wallhaven search API error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
