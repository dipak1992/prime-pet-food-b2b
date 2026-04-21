export interface ScoreInput {
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  hasInstagram: boolean;
  sellsDogTreats: boolean;
  sellsCompetitorProducts: boolean;
  rating?: number;
  reviewCount?: number;
  leadType?: string;
}

export interface ScoreResult {
  score: number;
  temperature: "HOT" | "WARM" | "COLD";
  reasons: string[];
}

export function calculateLeadScore(input: ScoreInput): ScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // Contact info (30 pts max)
  if (input.hasEmail) { score += 20; reasons.push("Has email (+20)"); }
  if (input.hasPhone) { score += 5; reasons.push("Has phone (+5)"); }
  if (input.hasInstagram) { score += 5; reasons.push("Has Instagram (+5)"); }

  // Product fit (40 pts max)
  if (input.sellsDogTreats) { score += 25; reasons.push("Sells dog treats (+25)"); }
  if (input.sellsCompetitorProducts) { score += 15; reasons.push("Sells competitor products (+15)"); }

  // Reputation (15 pts max)
  if (input.rating && input.rating >= 4.5) { score += 15; reasons.push("Rating ≥4.5 (+15)"); }
  else if (input.rating && input.rating >= 4.0) { score += 10; reasons.push("Rating ≥4.0 (+10)"); }
  else if (input.rating && input.rating >= 3.5) { score += 5; reasons.push("Rating ≥3.5 (+5)"); }

  // Lead type bonus (15 pts max)
  const typeBonus: Record<string, number> = {
    pet_store: 15,
    groomer: 12,
    vet: 8,
    daycare: 10,
    trainer: 8,
    boutique: 12,
    grocery: 6,
    distributor: 15,
    reseller: 12,
  };
  const bonus = input.leadType ? (typeBonus[input.leadType] ?? 5) : 5;
  score += bonus;
  reasons.push(`Lead type "${input.leadType ?? "unknown"}" (+${bonus})`);

  // Website bonus (built into contact)
  if (input.hasWebsite) { score += 5; reasons.push("Has website (+5)"); }

  const temperature: "HOT" | "WARM" | "COLD" =
    score >= 70 ? "HOT" : score >= 40 ? "WARM" : "COLD";

  return { score: Math.min(score, 100), temperature, reasons };
}

export function calculateRelevanceScore(params: {
  sellsDogTreats: boolean;
  sellsCompetitorProducts: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
  rating?: number;
}): number {
  let score = 0;
  if (params.sellsDogTreats) score += 35;
  if (params.sellsCompetitorProducts) score += 30;
  if (params.hasEmail) score += 15;
  if (params.hasWebsite) score += 10;
  if (params.rating && params.rating >= 4.0) score += 10;
  return score;
}
