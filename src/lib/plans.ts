export type PlanId = "starter" | "pro" | "agency";

export const PRO_PROMO_CODE = "EARLY";
export const PRO_PROMO_NOTE = `First 3 months for $8/month with code ${PRO_PROMO_CODE}`;
export const STARTER_VISIBLE_RECOMMENDATIONS = 5;

interface PlanCatalogEntry {
  badge?: string;
  description: string;
  features: string[];
  introPrice?: {
    discounted: string;
    label: string;
    original: string;
  };
  name: string;
  price: string;
}

export const PLAN_CATALOG: Record<PlanId, PlanCatalogEntry> = {
  starter: {
    name: "Starter",
    price: "$0/month",
    description: "For solo users getting started",
    features: [
      "1 site",
      "100 messages per cycle",
      "5 PageSpeed reports per cycle",
      "Basic AI model",
    ],
  },
  pro: {
    name: "Pro",
    price: "$16/month",
    introPrice: {
      original: "$16",
      discounted: "$8",
      label: "For the first 3 months",
    },
    description: "For growing teams and consultants",
    badge: "Popular",
    features: [
      "3 sites",
      "1000 messages per cycle",
      "20 PageSpeed reports per cycle",
      "Premium AI model",
      PRO_PROMO_NOTE,
    ],
  },
  agency: {
    name: "Agency",
    price: "$49/month",
    description: "For high-volume agency workflows",
    features: [
      "50 sites",
      "5000 messages per cycle",
      "100 PageSpeed reports per cycle",
      "Premium AI model",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["starter", "pro", "agency"];
