/**
 * Lead Finder Agent
 * Discovers potential wholesale leads using Google Places API.
 * Stores new leads in the database for qualification.
 */

import { prisma } from "@/lib/prisma";
import { getAiConfig } from "../config";
import { registerAgent, type AgentContext, type AgentRunResult } from "../runner";

interface PlaceResult {
  name: string;
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
  types?: string[];
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  place_id?: string;
  website?: string;
  formatted_phone_number?: string;
}

const SEARCH_QUERIES = [
  "pet store",
  "pet supply store",
  "pet boutique",
  "dog groomer",
  "veterinary clinic",
  "pet food store",
  "holistic pet store",
];

const DEFAULT_LOCATIONS = [
  { name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
  { name: "Dallas, TX", lat: 32.7767, lng: -96.797 },
  { name: "Denver, CO", lat: 39.7392, lng: -104.9903 },
  { name: "Austin, TX", lat: 30.2672, lng: -97.7431 },
  { name: "Nashville, TN", lat: 36.1627, lng: -86.7816 },
  { name: "Portland, OR", lat: 45.5152, lng: -122.6784 },
  { name: "Minneapolis, MN", lat: 44.9778, lng: -93.265 },
  { name: "Charlotte, NC", lat: 35.2271, lng: -80.8431 },
];

async function searchGooglePlaces(query: string, lat: number, lng: number, radius: number = 15000): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY not configured, using mock data");
    return [];
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function getPlaceDetails(placeId: string): Promise<Partial<PlaceResult>> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return {};

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "website,formatted_phone_number,name,formatted_address");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) return {};

  const data = await response.json();
  return data.result || {};
}

function extractEmailFromText(text: string): string | null {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  const email = matches?.find((candidate) => {
    const lower = candidate.toLowerCase();
    return !lower.endsWith(".png") && !lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.includes("example.com");
  });

  return email ?? null;
}

async function discoverWebsiteEmail(website: string | null | undefined): Promise<string | null> {
  if (!website) return null;

  try {
    const baseUrl = new URL(website);
    const paths = ["", "/contact", "/contact-us", "/about", "/about-us"];

    for (const path of paths) {
      const url = new URL(path, baseUrl);
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(5000),
        headers: {
          "user-agent": "PrimePetWholesaleLeadFinder/1.0",
        },
      });

      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) continue;

      const html = await response.text();
      const mailtoEmail = html.match(/mailto:([^"'?#\s>]+)/i)?.[1];
      const email = mailtoEmail || extractEmailFromText(html);
      if (email) return decodeURIComponent(email).trim();
    }
  } catch (error) {
    console.warn(`Unable to discover email from ${website}:`, error);
  }

  return null;
}

async function leadFinderAgent(context: AgentContext): Promise<AgentRunResult> {
  const config = getAiConfig();
  const maxLeads = config.safetyLimits.maxLeadsPerRun;

  // Pick a random location and query for this run
  const location = DEFAULT_LOCATIONS[Math.floor(Math.random() * DEFAULT_LOCATIONS.length)];
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];

  let newLeadsCount = 0;
  let duplicatesSkipped = 0;
  const foundLeads: Array<{ name: string; city: string }> = [];

  try {
    const places = await searchGooglePlaces(query, location.lat, location.lng);

    for (const place of places.slice(0, maxLeads)) {
      if (!place.name || place.business_status === "CLOSED_PERMANENTLY") continue;

      // Check for duplicates by name + address
      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            { businessName: place.name },
            ...(place.formatted_address ? [{ address: place.formatted_address }] : []),
          ],
        },
      });

      if (existing) {
        duplicatesSkipped++;
        continue;
      }

      // Get additional details if available
      let details: Partial<PlaceResult> = {};
      if (place.place_id) {
        details = await getPlaceDetails(place.place_id);
      }
      const website = details.website || place.website || null;
      const discoveredEmail = await discoverWebsiteEmail(website);

      // Parse city/state from address
      const addressParts = (place.formatted_address || "").split(",").map((s) => s.trim());
      const city = addressParts[1] || "";
      const stateZip = addressParts[2] || "";
      const state = stateZip.split(" ")[0] || "";

      // Create lead in database
      await prisma.lead.create({
        data: {
          businessName: place.name,
          contactName: "Owner/Manager",
          email: discoveredEmail || "",
          address: place.formatted_address || null,
          city: city || null,
          state: state || null,
          phone: details.formatted_phone_number || null,
          website,
          source: "AI_LEAD_FINDER",
          status: "NEW",
          leadScore: 0,
          notes: JSON.stringify({
            discoveredEmail,
            discoveredByRun: context.runId,
            googlePlaceId: place.place_id,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            searchQuery: query,
            searchLocation: location.name,
            types: place.types,
          }),
        },
      });

      newLeadsCount++;
      foundLeads.push({ name: place.name, city: city || location.name });
    }

    return {
      success: true,
      message: `Found ${newLeadsCount} new leads in ${location.name} (${duplicatesSkipped} duplicates skipped)`,
      data: {
        newLeads: newLeadsCount,
        duplicatesSkipped,
        searchQuery: query,
        searchLocation: location.name,
        leads: foundLeads,
      },
      recommendations: newLeadsCount > 0
        ? [
            {
              type: "lead_found",
              title: `${newLeadsCount} new leads found in ${location.name}`,
              description: `Lead Finder discovered ${newLeadsCount} potential wholesale customers searching for "${query}" in ${location.name}. Review and qualify these leads.`,
              priority: "medium" as const,
              actionUrl: "/admin/ai/leads",
              metadata: { leads: foundLeads },
            },
          ]
        : [],
    };
  } catch (error) {
    throw error;
  }
}

// Register the agent
registerAgent("lead_finder", leadFinderAgent);

export { leadFinderAgent };
