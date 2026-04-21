export interface LeadResult {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export const EXCLUDED_CHAINS = [
  "petsmart", "petco", "pet supplies plus", "walmart", "target", "costco",
  "banfield", "vca", "chewy", "petland", "petopia", "petshop",
];

export function isChainStore(name: string): boolean {
  const lower = name.toLowerCase();
  return EXCLUDED_CHAINS.some(chain => lower.includes(chain));
}

export async function runOverpassQuery(query: string): Promise<unknown[]> {
  const url = "https://overpass-api.de/api/interpreter";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  const data = await res.json() as { elements: unknown[] };
  return data.elements ?? [];
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function transformElements(elements: unknown[]): LeadResult[] {
  const results: LeadResult[] = [];
  for (const el of elements as OverpassElement[]) {
    const tags = el.tags ?? {};
    const name = tags["name"];
    if (!name || isChainStore(name)) continue;

    const lat = el.lat ?? el.center?.lat ?? 0;
    const lon = el.lon ?? el.center?.lon ?? 0;
    if (!lat || !lon) continue;

    results.push({
      name,
      address: tags["addr:street"] ? `${tags["addr:housenumber"] ?? ""} ${tags["addr:street"]}`.trim() : "",
      city: tags["addr:city"] ?? "",
      state: tags["addr:state"] ?? "",
      zip: tags["addr:postcode"] ?? "",
      phone: tags["phone"] ?? tags["contact:phone"],
      website: tags["website"] ?? tags["contact:website"],
      email: tags["email"] ?? tags["contact:email"],
      rating: undefined,
      reviewCount: undefined,
      lat,
      lon,
      tags,
    });
  }
  return results;
}

export function buildAreaFilter(city: string, state: string): string {
  const escapedCity = city.replace(/"/g, '\\"');
  const escapedState = state.replace(/"/g, '\\"');
  return `area["name"="${escapedCity}"]["admin_level"~"^[6-8]$"]->.city;
  area["name"="${escapedState}"]["admin_level"="4"]->.state;
  (area.city; area.state;)->.searchArea;`;
}

export function buildPetStoreQuery(city: string, state: string): string {
  const areaFilter = buildAreaFilter(city, state);
  return `[out:json][timeout:30];
${areaFilter}
(
  node["shop"="pet"](area.searchArea);
  way["shop"="pet"](area.searchArea);
  node["shop"="pet_store"](area.searchArea);
  way["shop"="pet_store"](area.searchArea);
);
out center;`;
}

export function buildGroomerQuery(city: string, state: string): string {
  const areaFilter = buildAreaFilter(city, state);
  return `[out:json][timeout:30];
${areaFilter}
(
  node["shop"="pet_grooming"](area.searchArea);
  way["shop"="pet_grooming"](area.searchArea);
  node["craft"="dog_grooming"](area.searchArea);
  way["craft"="dog_grooming"](area.searchArea);
  node["shop"="grooming"](area.searchArea);
  way["shop"="grooming"](area.searchArea);
);
out center;`;
}

export function buildVetQuery(city: string, state: string): string {
  const areaFilter = buildAreaFilter(city, state);
  return `[out:json][timeout:30];
${areaFilter}
(
  node["amenity"="veterinary"](area.searchArea);
  way["amenity"="veterinary"](area.searchArea);
  node["healthcare"="veterinary"](area.searchArea);
  way["healthcare"="veterinary"](area.searchArea);
);
out center;`;
}

export function buildDaycareQuery(city: string, state: string): string {
  const areaFilter = buildAreaFilter(city, state);
  return `[out:json][timeout:30];
${areaFilter}
(
  node["amenity"="animal_boarding"](area.searchArea);
  way["amenity"="animal_boarding"](area.searchArea);
  node["animal_boarding"="yes"](area.searchArea);
  way["animal_boarding"="yes"](area.searchArea);
);
out center;`;
}

export function buildTrainerQuery(city: string, state: string): string {
  const areaFilter = buildAreaFilter(city, state);
  return `[out:json][timeout:30];
${areaFilter}
(
  node["sport"="dog_agility"](area.searchArea);
  way["sport"="dog_agility"](area.searchArea);
  node["amenity"="animal_training"](area.searchArea);
  way["amenity"="animal_training"](area.searchArea);
);
out center;`;
}

export function buildBoutiqueQuery(city: string, state: string): string {
  const areaFilter = buildAreaFilter(city, state);
  return `[out:json][timeout:30];
${areaFilter}
(
  node["shop"="boutique"](area.searchArea);
  way["shop"="boutique"](area.searchArea);
  node["shop"="gift"](area.searchArea);
  way["shop"="gift"](area.searchArea);
);
out center;`;
}

export function buildGroceryQuery(city: string, state: string): string {
  const areaFilter = buildAreaFilter(city, state);
  return `[out:json][timeout:30];
${areaFilter}
(
  node["shop"="health_food"](area.searchArea);
  way["shop"="health_food"](area.searchArea);
  node["shop"="organic"](area.searchArea);
  way["shop"="organic"](area.searchArea);
);
out center;`;
}

export function getOverpassQuery(type: string, city: string, state: string): string {
  switch (type) {
    case "groomer": return buildGroomerQuery(city, state);
    case "vet": return buildVetQuery(city, state);
    case "daycare": return buildDaycareQuery(city, state);
    case "trainer": return buildTrainerQuery(city, state);
    case "boutique": return buildBoutiqueQuery(city, state);
    case "grocery": return buildGroceryQuery(city, state);
    default: return buildPetStoreQuery(city, state);
  }
}
