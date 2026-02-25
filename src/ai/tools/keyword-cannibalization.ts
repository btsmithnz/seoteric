import { tool } from "ai";
import { z } from "zod";
import { dataforseoPost } from "@/lib/dataforseo";

interface DfsOnPageItem {
  resource_type: string;
  url: string;
  meta: {
    title: string | null;
    description: string | null;
    htags: { h1?: string[] } | null;
  } | null;
  keyword_density: Record<string, number> | null;
}

interface DfsOnPageResponse {
  tasks: Array<{
    status_code: number;
    status_message: string;
    result: Array<{
      items: DfsOnPageItem[];
    }> | null;
  }>;
}

interface PageData {
  url: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  primaryKeyword: string | null;
  topKeywords: string[];
}

type RiskLevel = "high" | "medium" | "low";

const TOP_KEYWORDS_COUNT = 5;
const OVERLAP_THRESHOLD = 2;
const WHITESPACE_REGEX = /\s+/;

function extractTopKeywords(density: Record<string, number> | null): string[] {
  if (!density) {
    return [];
  }
  return Object.entries(density)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_KEYWORDS_COUNT)
    .map(([kw]) => kw.toLowerCase());
}

function normalize(text: string | null): string {
  return (text ?? "").toLowerCase().trim();
}

function titleWordOverlap(a: string | null, b: string | null): number {
  const wordsA = new Set(
    normalize(a)
      .split(WHITESPACE_REGEX)
      .filter((w) => w.length > 3)
  );
  const wordsB = normalize(b)
    .split(WHITESPACE_REGEX)
    .filter((w) => w.length > 3);
  return wordsB.filter((w) => wordsA.has(w)).length;
}

function keywordOverlap(aKeywords: string[], bKeywords: string[]): string[] {
  const setA = new Set(aKeywords);
  return bKeywords.filter((kw) => setA.has(kw));
}

function getRiskLevel(
  samePrimaryKeyword: boolean,
  sharedKeywords: string[],
  titleOverlapWords: number
): RiskLevel {
  if (samePrimaryKeyword || sharedKeywords.length >= 3) {
    return "high";
  }
  if (sharedKeywords.length >= OVERLAP_THRESHOLD || titleOverlapWords >= 3) {
    return "medium";
  }
  return "low";
}

function buildPageData(response: DfsOnPageResponse, url: string): PageData {
  const item = response.tasks[0]?.result?.[0]?.items?.find(
    (i) => i.resource_type === "html"
  );
  const topKeywords = extractTopKeywords(item?.keyword_density ?? null);
  return {
    url,
    title: item?.meta?.title ?? null,
    description: item?.meta?.description ?? null,
    h1: item?.meta?.htags?.h1?.[0] ?? null,
    primaryKeyword: topKeywords[0] ?? null,
    topKeywords,
  };
}

function buildPairSummary(
  a: PageData,
  b: PageData,
  sharedKeywords: string[],
  titleOverlapWords: number,
  samePrimaryKeyword: boolean
) {
  const riskLevel = getRiskLevel(
    samePrimaryKeyword,
    sharedKeywords,
    titleOverlapWords
  );

  const parts: string[] = [];
  if (samePrimaryKeyword) {
    parts.push(`same primary keyword "${a.primaryKeyword}"`);
  }
  if (sharedKeywords.length > 0) {
    parts.push(
      `${sharedKeywords.length} shared top keywords (${sharedKeywords.slice(0, 3).join(", ")})`
    );
  }
  if (titleOverlapWords > 0) {
    parts.push(`${titleOverlapWords} overlapping title words`);
  }

  return {
    urlA: a.url,
    urlB: b.url,
    sharedKeywords,
    titleOverlapWords,
    samePrimaryKeyword,
    riskLevel,
    summary: parts.join("; "),
  };
}

export const checkKeywordCannibalizationTool = tool({
  description:
    "Check for keyword cannibalization across multiple URLs by comparing their primary keywords, title overlap, and top keyword density. Identifies pairs of pages likely competing for the same search queries.",
  inputSchema: z.object({
    urls: z
      .array(z.url())
      .min(2)
      .max(10)
      .describe("Array of 2–10 URLs to check for keyword cannibalization"),
  }),
  execute: async ({ urls }) => {
    try {
      const responses = await Promise.all(
        urls.map((url) =>
          dataforseoPost<DfsOnPageResponse>("/on_page/instant_pages", [
            {
              url,
              load_resources: false,
              enable_javascript: false,
              calculate_keyword_density: true,
            },
          ])
        )
      );

      const pages = responses.map((response, idx) =>
        buildPageData(response, urls[idx])
      );

      const riskOrder: Record<RiskLevel, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };
      const cannibalizationPairs: ReturnType<typeof buildPairSummary>[] = [];

      for (let i = 0; i < pages.length; i++) {
        for (let j = i + 1; j < pages.length; j++) {
          const a = pages[i];
          const b = pages[j];

          const sharedKeywords = keywordOverlap(a.topKeywords, b.topKeywords);
          const titleOverlapWords = titleWordOverlap(a.title, b.title);
          const samePrimaryKeyword =
            a.primaryKeyword !== null && a.primaryKeyword === b.primaryKeyword;

          const hasOverlap =
            sharedKeywords.length >= OVERLAP_THRESHOLD ||
            titleOverlapWords >= OVERLAP_THRESHOLD ||
            samePrimaryKeyword;

          if (hasOverlap) {
            cannibalizationPairs.push(
              buildPairSummary(
                a,
                b,
                sharedKeywords,
                titleOverlapWords,
                samePrimaryKeyword
              )
            );
          }
        }
      }

      cannibalizationPairs.sort(
        (a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
      );

      return {
        pages: pages.map((p) => ({
          url: p.url,
          title: p.title,
          primaryKeyword: p.primaryKeyword,
          topKeywords: p.topKeywords,
        })),
        cannibalizationPairs,
        summary: {
          totalPairsAnalyzed: (urls.length * (urls.length - 1)) / 2,
          pairsWithOverlap: cannibalizationPairs.length,
          highRisk: cannibalizationPairs.filter((p) => p.riskLevel === "high")
            .length,
          mediumRisk: cannibalizationPairs.filter(
            (p) => p.riskLevel === "medium"
          ).length,
        },
      };
    } catch (error) {
      return {
        error: `Error checking keyword cannibalization: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
