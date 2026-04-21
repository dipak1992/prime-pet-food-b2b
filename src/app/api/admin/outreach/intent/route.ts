import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { searchDistributors, searchResellers } from "@/lib/intent-search";

export async function POST(req: NextRequest) {
  await requireAdmin();

  const { product, location, type } = await req.json() as {
    product?: string;
    location?: string;
    type?: "distributors" | "resellers" | "both";
  };

  if (!product || !location) {
    return NextResponse.json({ error: "product and location are required" }, { status: 400 });
  }

  try {
    const searchType = type ?? "both";
    const [distributors, resellers] = await Promise.all([
      searchType !== "resellers" ? searchDistributors(product, location) : [],
      searchType !== "distributors" ? searchResellers(product, location) : [],
    ]);

    const results = [...distributors, ...resellers];
    return NextResponse.json({ results, count: results.length });
  } catch (err) {
    console.error("Intent search error:", err);
    return NextResponse.json({ error: "Intent search failed" }, { status: 500 });
  }
}
