import { NextRequest, NextResponse } from "next/server";
import { WALLHAVEN_CONFIG } from "@/lib/config/wallhaven";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    config: {
      baseUrl: WALLHAVEN_CONFIG.BASE_URL,
      hasApiKey: !!WALLHAVEN_CONFIG.API_KEY,
      apiKeyLength: WALLHAVEN_CONFIG.API_KEY?.length || 0,
    },
    env: {
      hasNextPublicBaseUrl: !!process.env.NEXT_PUBLIC_WALLHAVEN_BASE_URL,
      hasNextPublicApiKey: !!process.env.NEXT_PUBLIC_WALLHAVEN_API_KEY,
    },
  });
}
