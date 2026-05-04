type MetricOrder = {
  createdAt: Date | string;
  grandTotal: number | { toString(): string };
  paymentStatus?: string;
};

export type CustomerMetrics = {
  healthScore: number;
  healthLabel: "Healthy" | "Watch" | "At Risk";
  reorderRisk: "LOW" | "MEDIUM" | "HIGH";
  daysSinceLastOrder: number | null;
  recommendedTier: "BRONZE" | "SILVER" | "GOLD";
  nextTierHint: string;
};

function toNumber(value: number | { toString(): string }) {
  return typeof value === "number" ? value : Number(value);
}

export function calculateCustomerMetrics(orders: MetricOrder[], currentTier = "BRONZE"): CustomerMetrics {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastOrder = sorted[0];
  const daysSinceLastOrder = lastOrder
    ? Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / 86_400_000)
    : null;
  const totalSpent = sorted.reduce((sum, order) => sum + toNumber(order.grandTotal), 0);
  const paidShare =
    sorted.length === 0
      ? 0
      : sorted.filter((order) => order.paymentStatus === "PAID").length / sorted.length;

  let score = 35;
  score += Math.min(sorted.length * 8, 25);
  score += Math.min(totalSpent / 100, 20);
  score += paidShare * 10;
  if (daysSinceLastOrder == null) score -= 25;
  else if (daysSinceLastOrder <= 30) score += 10;
  else if (daysSinceLastOrder <= 60) score -= 5;
  else score -= 20;

  const healthScore = Math.max(0, Math.min(100, Math.round(score)));
  const healthLabel = healthScore >= 75 ? "Healthy" : healthScore >= 50 ? "Watch" : "At Risk";
  const reorderRisk =
    daysSinceLastOrder == null || daysSinceLastOrder > 75
      ? "HIGH"
      : daysSinceLastOrder > 45
        ? "MEDIUM"
        : "LOW";

  const recommendedTier = totalSpent >= 5000 || sorted.length >= 10 ? "GOLD" : totalSpent >= 1500 || sorted.length >= 4 ? "SILVER" : "BRONZE";
  const nextTierHint =
    currentTier === "GOLD"
      ? "Top tier account"
      : recommendedTier !== currentTier
        ? `Recommend moving to ${recommendedTier}`
        : currentTier === "BRONZE"
          ? `$${Math.max(0, 1500 - totalSpent).toFixed(0)} to Silver target`
          : `$${Math.max(0, 5000 - totalSpent).toFixed(0)} to Gold target`;

  return { healthScore, healthLabel, reorderRisk, daysSinceLastOrder, recommendedTier, nextTierHint };
}
