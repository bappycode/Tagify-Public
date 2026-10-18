export type PlanTier =
  "free" | "pro" | "pro_plus" | "business" | "business_plus" | "enterprise" | "enterprise_plus";

export const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 10_000,
  pro: 500_000,
  pro_plus: 2_000_000,
  business: 5_000_000,
  business_plus: 10_000_000,
  enterprise: 20_000_000,
  enterprise_plus: 50_000_000,
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: "Free",
  pro: "Pro",
  pro_plus: "Pro+",
  business: "Business",
  business_plus: "Business+",
  enterprise: "Enterprise",
  enterprise_plus: "Enterprise+",
};

export const PLAN_ORDER: PlanTier[] = [
  "free",
  "pro",
  "pro_plus",
  "business",
  "business_plus",
  "enterprise",
  "enterprise_plus",
];

export const SGTM_PRICES: Record<PlanTier, number> = {
  free: 0,
  pro: 20,
  pro_plus: 50,
  business: 100,
  business_plus: 150,
  enterprise: 200,
  enterprise_plus: 300,
};
export const GATEWAY_PRICES: Record<PlanTier, number> = {
  free: 0,
  pro: 25,
  pro_plus: 55,
  business: 105,
  business_plus: 155,
  enterprise: 205,
  enterprise_plus: 305,
};

export function normalizeTier(t?: string | null): PlanTier {
  const v = (t || "free").toLowerCase() as PlanTier;
  return (v in PLAN_LIMITS ? v : "free") as PlanTier;
}

export function getLimit(t?: string | null): number {
  return PLAN_LIMITS[normalizeTier(t)];
}

export function getPlanLabel(t?: string | null): string {
  return PLAN_LABELS[normalizeTier(t)];
}

export function usageColor(pct: number): {
  bar: string;
  text: string;
  chip: string;
} {
  if (pct >= 95)
    return {
      bar: "bg-red-500",
      text: "text-red-700",
      chip: "border-red-500/30 bg-red-500/10 text-red-700",
    };
  if (pct >= 85)
    return {
      bar: "bg-orange-500",
      text: "text-orange-700",
      chip: "border-orange-500/30 bg-orange-500/10 text-orange-700",
    };
  if (pct >= 75)
    return {
      bar: "bg-yellow-500",
      text: "text-yellow-700",
      chip: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
    };
  return {
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  };
}

export function usagePercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}
