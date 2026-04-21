export interface IntentResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  leadType: "distributor" | "reseller";
}

async function serperSearch(query: string): Promise<IntentResult[]> {
  const apiKey = process.env["SERPER_API_KEY"];
  if (!apiKey) return [];

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 10 }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return [];

  const data = await res.json() as {
    organic?: Array<{ title?: string; link?: string; snippet?: string }>;
  };

  return (data.organic ?? []).map(item => {
    let domain = "";
    try {
      domain = new URL(item.link ?? "").hostname.replace("www.", "");
    } catch {
      domain = item.link ?? "";
    }
    return {
      title: item.title ?? "",
      url: item.link ?? "",
      snippet: item.snippet ?? "",
      domain,
      leadType: "distributor" as const,
    };
  });
}

export async function searchDistributors(
  product: string,
  location: string
): Promise<IntentResult[]> {
  const queries = [
    `"${product}" wholesale distributor ${location}`,
    `buy "${product}" in bulk ${location} distributor`,
    `pet food distributor ${location} wholesale`,
  ];

  const results: IntentResult[] = [];
  for (const q of queries) {
    const hits = await serperSearch(q);
    results.push(...hits.map(h => ({ ...h, leadType: "distributor" as const })));
  }

  // Deduplicate by domain
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.domain)) return false;
    seen.add(r.domain);
    return true;
  });
}

export async function searchResellers(
  product: string,
  location: string
): Promise<IntentResult[]> {
  const queries = [
    `"${product}" retailer ${location}`,
    `pet treats store ${location} carrying premium brands`,
    `independent pet store ${location} site:yelp.com OR site:google.com`,
  ];

  const results: IntentResult[] = [];
  for (const q of queries) {
    const hits = await serperSearch(q);
    results.push(...hits.map(h => ({ ...h, leadType: "reseller" as const })));
  }

  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.domain)) return false;
    seen.add(r.domain);
    return true;
  });
}

export async function webSearch(query: string): Promise<IntentResult[]> {
  const results = await serperSearch(query);
  return results.map(r => ({ ...r, leadType: "distributor" as const }));
}
