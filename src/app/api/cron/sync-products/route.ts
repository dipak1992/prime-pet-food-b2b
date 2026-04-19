import { NextResponse } from "next/server";

/**
 * Upstash Cron Job Handler
 * Triggered every 6 hours to sync products from Shopify
 * 
 * Setup in Upstash Console:
 * 1. Go to https://console.upstash.com/qstash
 * 2. Create new Schedule with:
 *    - URL: https://your-domain.com/api/cron/sync-products
 *    - Cron: 0 */6 * * * (every 6 hours)
 *    - Authorization Header: Add CRON_SECRET from .env
 */

export async function POST(request: Request) {
  // Verify Upstash signature
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.UPSTASH_CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Call the main sync endpoint internally
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/admin/products/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-trigger": "true", // Flag for internal cron calls
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Sync failed:", error);
      return NextResponse.json(
        { error: "Sync failed", details: error },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Scheduled sync completed:", result);

    return NextResponse.json({
      success: true,
      message: "Product sync triggered successfully",
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json(
      {
        error: "Cron sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
