export const MEMORY_KEYS = {
  GENERAL: "general",
  BUSINESS_REVIEW: "business-review",
  COMPETITOR_ANALYSIS: "competitor-analysis",
  TECHNICAL_AUDIT: "technical-audit",
} as const;

export type MemoryKey = (typeof MEMORY_KEYS)[keyof typeof MEMORY_KEYS];
