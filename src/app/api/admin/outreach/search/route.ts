import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { runOverpassQuery, transformElements, getOverpassQuery } from "@/lib/overpass";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const city = request.nextUrl.searchParams.get("city")?.trim();
  const state = request.nextUrl.searchParams.get("state")?.trim() ?? "";
  const type = request.nextUrl.searchParams.get("type")?.trim() ?? "pet_store";

  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  try {
    const query = getOverpassQuery(type, city, state);
    const elements = await runOverpassQuery(query);
    const stores = transformElements(elements);
    return NextResponse.json({ stores, count: stores.length });
  } catch (err) {
    console.error("Outreach search error:", err);
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
