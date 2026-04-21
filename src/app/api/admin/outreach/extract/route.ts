import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { scrapeWebsite } from "@/lib/lead-scraper";

export async function POST(req: NextRequest) {
  await requireAdmin();

  const { url } = await req.json() as { url?: string };
  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
  }

  try {
    const result = await scrapeWebsite(url);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("Website scrape error:", err);
    return NextResponse.json({ error: "Failed to scrape website" }, { status: 500 });
  }
}
