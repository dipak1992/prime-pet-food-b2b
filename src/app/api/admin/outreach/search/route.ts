import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const EXCLUDED_CHAINS = ["petsmart", "petco", "pet supplies plus"];

function isChainStore(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return EXCLUDED_CHAINS.some((chain) => lower.includes(chain));
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function buildQuery(city: string, state: string): string {
  return `[out:json][timeout:30];
area["name"="${state}"]["admin_level"="4"]->.state;
area["name"="${city}"](area.state)->.searchArea;
(
  node["shop"="pet"](area.searchArea);
  way["shop"="pet"](area.searchArea);
  node["shop"="pet;grooming"](area.searchArea);
  way["shop"="pet;grooming"](area.searchArea);
  node["shop"="pet_food"](area.searchArea);
  way["shop"="pet_food"](area.searchArea);
);
out body center;`;
}

function buildQueryFallback(city: string): string {
  return `[out:json][timeout:30];
area["name"="${city}"]->.searchArea;
(
  node["shop"="pet"](area.searchArea);
  way["shop"="pet"](area.searchArea);
  node["shop"="pet;grooming"](area.searchArea);
  way["shop"="pet;grooming"](area.searchArea);
  node["shop"="pet_food"](area.searchArea);
  way["shop"="pet_food"](area.searchArea);
);
out body center;`;
}

async function searchOverpass(city: string, state?: string) {
  const query = state ? buildQuery(city, state) : buildQueryFallback(city);

  let res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  let data = await res.json();

  if (state && (!data.elements || data.elements.length === 0)) {
    const fallback = buildQueryFallback(city);
    res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(fallback)}`,
    });
    data = await res.json();
  }

  if (!res.ok) return [];

  return (data.elements || [])
    .filter((el: OverpassElement) => el.tags?.name && !isChainStore(el.tags.name))
    .map((el: OverpassElement) => {
      const tags = el.tags || {};
      return {
        osmId: `${el.type}/${el.id}`,
        name: tags.name,
        address:
          [tags["addr:housenumber"], tags["addr:street"]]
            .filter(Boolean)
            .join(" ") || "",
        city: tags["addr:city"] || city,
        state: tags["addr:state"] || state || "",
        zip: tags["addr:postcode"] || "",
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        email: tags.email || tags["contact:email"] || null,
      };
    });
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const city = request.nextUrl.searchParams.get("city")?.trim();
  const state = request.nextUrl.searchParams.get("state")?.trim();

  if (!city) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  try {
    const stores = await searchOverpass(city, state || undefined);
    return NextResponse.json({ stores, count: stores.length });
  } catch (err) {
    console.error("Outreach search error:", err);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}
