/** biome-ignore-all lint/suspicious/noExplicitAny: <api types> */
export interface CoreWebVitals {
  cls: {
    value: number;
    displayValue: string;
    rating: "good" | "needs-improvement" | "poor";
  } | null;
  fcp: {
    value: number;
    displayValue: string;
    rating: "good" | "needs-improvement" | "poor";
  } | null;
  inp: {
    value: number;
    displayValue: string;
    rating: "good" | "needs-improvement" | "poor";
  } | null;
  lcp: {
    value: number;
    displayValue: string;
    rating: "good" | "needs-improvement" | "poor";
  } | null;
  ttfb: {
    value: number;
    displayValue: string;
    rating: "good" | "needs-improvement" | "poor";
  } | null;
}

export interface PageSpeedOpportunity {
  description: string;
  id: string;
  savings: string | null;
  score: number | null;
  title: string;
}

export interface PageSpeedResult {
  coreWebVitals: CoreWebVitals;
  diagnostics: PageSpeedOpportunity[];
  fetchTime: string;
  finalUrl: string;
  opportunities: PageSpeedOpportunity[];
  performanceScore: number;
  strategy: "mobile" | "desktop";
  url: string;
}

export interface PageSpeedError {
  error: string;
}

export type PageSpeedResponse = PageSpeedResult | PageSpeedError;

type MetricRating = "good" | "needs-improvement" | "poor";

function getMetricRating(score: number | undefined): MetricRating {
  if (score === undefined || score === null) {
    return "poor";
  }
  if (score >= 0.9) {
    return "good";
  }
  if (score >= 0.5) {
    return "needs-improvement";
  }
  return "poor";
}

function parseMetric(
  audit: {
    numericValue?: number;
    displayValue?: string;
    score?: number | null;
  } | null
): { value: number; displayValue: string; rating: MetricRating } | null {
  if (!audit || audit.numericValue === undefined) {
    return null;
  }
  return {
    value: audit.numericValue,
    displayValue: audit.displayValue || `${Math.round(audit.numericValue)}`,
    rating: getMetricRating(audit.score ?? undefined),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parsePageSpeedResponse(data: any): PageSpeedResult {
  const lighthouseResult = data.lighthouseResult;
  const audits = lighthouseResult.audits;
  const categories = lighthouseResult.categories;

  const performanceScore = Math.round(
    (categories?.performance?.score ?? 0) * 100
  );

  const coreWebVitals: CoreWebVitals = {
    lcp: parseMetric(audits["largest-contentful-paint"]),
    cls: parseMetric(audits["cumulative-layout-shift"]),
    inp: parseMetric(audits["interaction-to-next-paint"]),
    fcp: parseMetric(audits["first-contentful-paint"]),
    ttfb: parseMetric(audits["server-response-time"]),
  };

  // Extract opportunities (audits with savings)
  const opportunities: PageSpeedOpportunity[] = [];
  const opportunityIds =
    categories?.performance?.auditRefs
      ?.filter((ref: any) => ref.group === "load-opportunities")
      ?.map((ref: any) => ref.id) ?? [];

  for (const id of opportunityIds) {
    const audit = audits[id];
    if (audit && audit.score !== null && audit.score < 1) {
      opportunities.push({
        id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        savings: audit.displayValue || null,
      });
    }
  }

  // Sort by score (lowest first = biggest impact)
  opportunities.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

  // Extract diagnostics
  const diagnostics: PageSpeedOpportunity[] = [];
  const diagnosticIds =
    categories?.performance?.auditRefs
      ?.filter((ref: any) => ref.group === "diagnostics")
      ?.map((ref: any) => ref.id) ?? [];

  for (const id of diagnosticIds) {
    const audit = audits[id];
    if (audit && audit.score !== null && audit.score < 1) {
      diagnostics.push({
        id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        savings: audit.displayValue || null,
      });
    }
  }

  diagnostics.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

  return {
    url: data.id,
    finalUrl: lighthouseResult.finalUrl,
    strategy: lighthouseResult.configSettings?.formFactor || "mobile",
    performanceScore,
    coreWebVitals,
    opportunities: opportunities.slice(0, 5), // Top 5 opportunities
    diagnostics: diagnostics.slice(0, 5), // Top 5 diagnostics
    fetchTime: lighthouseResult.fetchTime,
  };
}

export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function checkAuth(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.INTERNAL_API_KEY;
  return !!expectedToken && authHeader === `Bearer ${expectedToken}`;
}
