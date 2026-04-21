export function extractEmails(text: string): string[] {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [];
  return [...new Set(matches.filter(e => !e.includes("sentry") && !e.includes("example") && !e.includes("@2x")))];
}

export function extractSocialLinks(html: string): { instagram?: string; facebook?: string } {
  const igMatch = html.match(/instagram\.com\/([\w.]+)/i);
  const fbMatch = html.match(/facebook\.com\/([\w.]+)/i);
  return {
    instagram: igMatch ? `https://instagram.com/${igMatch[1]}` : undefined,
    facebook: fbMatch ? `https://facebook.com/${fbMatch[1]}` : undefined,
  };
}

const DOG_TREAT_KEYWORDS = [
  "dog treat", "dog treats", "dog snack", "dog food", "pet food", "biscuit",
  "dog biscuit", "training treat", "dog chew", "pup treat", "puppy treat",
  "pet treat", "raw food", "freeze dried", "freeze-dried", "dehydrated", "jerky"
];

const COMPETITOR_BRANDS = [
  "zuke", "greenies", "milk-bone", "milkbone", "wellness", "blue buffalo",
  "orijen", "acana", "stella & chewy", "primal", "nature's variety",
  "instinct", "merrick", "whole earth farms", "rachael ray", "purina",
  "hill's", "hills", "royal canin", "taste of the wild", "nutro"
];

export function detectDogTreatKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return DOG_TREAT_KEYWORDS.filter(k => lower.includes(k));
}

export function detectCompetitorBrands(text: string): string[] {
  const lower = text.toLowerCase();
  return COMPETITOR_BRANDS.filter(b => lower.includes(b));
}

export interface ScrapeResult {
  emails: string[];
  instagram?: string;
  facebook?: string;
  sellsDogTreats: boolean;
  treatKeywords: string[];
  competitorBrands: string[];
  pagesScanned: number;
}

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  const baseUrl = url.replace(/\/$/, "");
  const paths = ["", "/contact", "/about", "/about-us", "/contact-us"];
  const allEmails: string[] = [];
  let instagram: string | undefined;
  let facebook: string | undefined;
  const allTreatKeywords: string[] = [];
  const allCompetitorBrands: string[] = [];
  let pagesScanned = 0;

  for (const path of paths) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PrimePetBot/1.0)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      pagesScanned++;

      allEmails.push(...extractEmails(html));
      const socials = extractSocialLinks(html);
      if (socials.instagram && !instagram) instagram = socials.instagram;
      if (socials.facebook && !facebook) facebook = socials.facebook;
      allTreatKeywords.push(...detectDogTreatKeywords(html));
      allCompetitorBrands.push(...detectCompetitorBrands(html));
    } catch {
      // ignore individual page failures
    }
  }

  const emails = [...new Set(allEmails)];
  const treatKeywords = [...new Set(allTreatKeywords)];
  const competitorBrands = [...new Set(allCompetitorBrands)];

  return {
    emails,
    instagram,
    facebook,
    sellsDogTreats: treatKeywords.length > 0,
    treatKeywords,
    competitorBrands,
    pagesScanned,
  };
}
