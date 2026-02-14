export const PLAN_LIMITS = {
  free: {
    sites: 1,
    messagesPerMonth: 100,
    activeRecommendations: 3,
    pageSpeedTestsPerMonth: 5,
    model: "anthropic/claude-haiku-4.5" as const,
  },
  proMonthly: {
    sites: 5,
    messagesPerMonth: 1000,
    activeRecommendations: Number.POSITIVE_INFINITY,
    pageSpeedTestsPerMonth: 50,
    model: "anthropic/claude-sonnet-4.5" as const,
  },
  agencyMonthly: {
    sites: 50,
    messagesPerMonth: 10_000,
    activeRecommendations: Number.POSITIVE_INFINITY,
    pageSpeedTestsPerMonth: 200,
    model: "anthropic/claude-sonnet-4.5" as const,
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;
export type PlanLimits = (typeof PLAN_LIMITS)[PlanKey];

export function getPlanLimits(productKey: string | undefined): PlanLimits {
  if (productKey && productKey in PLAN_LIMITS) {
    return PLAN_LIMITS[productKey as PlanKey];
  }
  return PLAN_LIMITS.free;
}
