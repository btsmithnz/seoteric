import { tool } from "ai";
import { z } from "zod";
import { dataforseoPost } from "@/lib/dataforseo";

interface DfsLink {
  href: string;
  anchor: string | null;
  dofollow: boolean;
}

interface DfsStructuredDataItem {
  type?: string;
  properties?: Record<string, unknown>;
  errors?: string[];
  warnings?: string[];
}

interface DfsOnPageItem {
  resource_type: string;
  status_code: number;
  url: string;
  meta: {
    title: string | null;
    description: string | null;
    canonical: string | null;
    robots: string | null;
    htags: { h1?: string[]; h2?: string[]; h3?: string[] } | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_url: string | null;
    og_type: string | null;
    images_count: number;
    images_without_alt_count: number;
    internal_links_count: number;
    external_links_count: number;
  } | null;
  content: {
    plain_text_word_count: number;
    plain_text_rate: number;
    flesch_reading_ease: number | null;
    flesch_kincaid_grade_level: number | null;
    automated_readability_index: number | null;
  } | null;
  structured_data: {
    types: string[];
    count: number;
    items: DfsStructuredDataItem[];
    errors?: string[];
    warnings?: string[];
  } | null;
  keyword_density: Record<string, number> | null;
  links: {
    internal: DfsLink[];
    external: DfsLink[];
  } | null;
  checks: {
    is_redirect: boolean;
    is_broken: boolean;
    is_https: boolean;
    canonical_to_redirect: boolean;
  } | null;
  response_headers: Record<string, string> | null;
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

const MAX_LINKS = 30;
const TOP_KEYWORDS = 10;
const NOINDEX_REGEX = /noindex/i;
const NOINDEX_OR_HTTP_ERROR_REGEX = /noindex|HTTP error/i;

function buildIndexabilityIssues(item: DfsOnPageItem, url: string): string[] {
  const issues: string[] = [];
  const meta = item.meta;
  const checks = item.checks;

  if (item.status_code >= 400) {
    issues.push(`HTTP error: ${item.status_code}`);
  }

  const metaRobots = meta?.robots ?? null;
  if (metaRobots && NOINDEX_REGEX.test(metaRobots)) {
    issues.push(`Meta robots: "${metaRobots}"`);
  }

  const xRobotsTag =
    item.response_headers?.["x-robots-tag"] ??
    item.response_headers?.["X-Robots-Tag"] ??
    null;
  if (xRobotsTag && NOINDEX_REGEX.test(xRobotsTag)) {
    issues.push(`X-Robots-Tag: "${xRobotsTag}"`);
  }

  if (checks?.canonical_to_redirect) {
    issues.push("Canonical points to a redirect");
  }

  if (meta?.canonical) {
    try {
      const canonicalNorm = new URL(meta.canonical).href;
      const urlNorm = new URL(url).href;
      if (canonicalNorm !== urlNorm) {
        issues.push(`Canonical points elsewhere: ${meta.canonical}`);
      }
    } catch {
      // Malformed canonical URL — not an issue we can check
    }
  } else {
    issues.push("Missing canonical tag");
  }

  return issues;
}

function getTopKeywords(
  density: Record<string, number> | null
): { keyword: string; densityPercent: number }[] {
  return Object.entries(density ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_KEYWORDS)
    .map(([keyword, d]) => ({
      keyword,
      densityPercent: Math.round(d * 10_000) / 100,
    }));
}

function buildStructuredDataSummary(sd: DfsOnPageItem["structured_data"]): {
  present: boolean;
  types: string[];
  count: number;
  errors: string[];
  warnings: string[];
} {
  const errors = [
    ...(sd?.errors ?? []),
    ...(sd?.items.flatMap((i) => i.errors ?? []) ?? []),
  ];
  const warnings = [
    ...(sd?.warnings ?? []),
    ...(sd?.items.flatMap((i) => i.warnings ?? []) ?? []),
  ];
  return {
    present: (sd?.count ?? 0) > 0,
    types: sd?.types ?? [],
    count: sd?.count ?? 0,
    errors,
    warnings,
  };
}

function mapItemToResult(
  item: DfsOnPageItem,
  url: string,
  indexabilityIssues: string[],
  internalLinks: DfsLink[],
  externalLinks: DfsLink[]
) {
  const {
    title = null,
    description: metaDescription = null,
    canonical = null,
    robots: metaRobots = null,
    htags = null,
    og_title: ogTitle = null,
    og_description: ogDescription = null,
    og_image: ogImage = null,
    og_url: ogUrl = null,
    og_type: ogType = null,
    images_count: imagesCount = 0,
    images_without_alt_count: missingAltCount = 0,
    internal_links_count: internalLinksCount = internalLinks.length,
    external_links_count: externalLinksCount = externalLinks.length,
  } = item.meta ?? {};

  const {
    plain_text_word_count: wordCount = 0,
    plain_text_rate: textToHtmlRatio = null,
    flesch_reading_ease: fleschReadingEase = null,
    flesch_kincaid_grade_level: fleschKincaidGrade = null,
    automated_readability_index: automatedReadabilityIndex = null,
  } = item.content ?? {};

  const { is_redirect: isRedirect = false, is_https: isHttps = false } =
    item.checks ?? {};

  const xRobotsTag =
    item.response_headers?.["x-robots-tag"] ??
    item.response_headers?.["X-Robots-Tag"] ??
    null;

  return {
    url,
    title,
    titleLength: (title ?? "").length,
    metaDescription,
    metaDescriptionLength: (metaDescription ?? "").length,
    canonical,
    ogTags: {
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: ogUrl,
      type: ogType,
    },
    headings: {
      h1: htags?.h1 ?? [],
      h2: (htags?.h2 ?? []).slice(0, 20),
      h3: (htags?.h3 ?? []).slice(0, 20),
    },
    links: {
      internalCount: internalLinksCount,
      externalCount: externalLinksCount,
      internalSample: internalLinks,
      externalSample: externalLinks,
    },
    images: { totalCount: imagesCount, missingAltCount },
    wordCount,
    readability: {
      fleschReadingEase,
      fleschKincaidGrade,
      automatedReadabilityIndex,
    },
    textToHtmlRatio,
    topKeywords: getTopKeywords(item.keyword_density),
    structuredData: buildStructuredDataSummary(item.structured_data),
    httpStatus: item.status_code,
    indexable:
      item.status_code < 400 &&
      !indexabilityIssues.some((i) => NOINDEX_OR_HTTP_ERROR_REGEX.test(i)),
    indexabilityIssues,
    metaRobots,
    xRobotsTag,
    isRedirect,
    isHttps,
  };
}

async function executeAnalyzePage(url: string) {
  try {
    const response = await dataforseoPost<DfsOnPageResponse>(
      "/on_page/instant_pages",
      [
        {
          url,
          load_resources: false,
          enable_javascript: false,
          validate_micromarkup: true,
          calculate_keyword_density: true,
        },
      ]
    );

    const task = response.tasks[0];
    if (!task || task.status_code !== 20_000) {
      return {
        error: `DataForSEO task error: ${task?.status_message ?? "Unknown error"}`,
      };
    }

    const item = task.result?.[0]?.items?.find(
      (i) => i.resource_type === "html"
    );
    if (!item) {
      return { error: "No HTML page data returned for URL" };
    }

    const indexabilityIssues = buildIndexabilityIssues(item, url);
    const internalLinks = (item.links?.internal ?? []).slice(0, MAX_LINKS);
    const externalLinks = (item.links?.external ?? []).slice(0, MAX_LINKS);
    return mapItemToResult(
      item,
      url,
      indexabilityIssues,
      internalLinks,
      externalLinks
    );
  } catch (error) {
    return {
      error: `Error analyzing page: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export const analyzePageTool = tool({
  description:
    "Comprehensive page analysis covering on-page SEO (title, meta, headings, links, images), content quality (word count, readability, keyword density), structured data validation, and indexability (HTTP status, robots directives, canonical, redirects). Use this instead of separate SEO, content, structured data, or indexability tools.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the page to analyze"),
  }),
  execute: ({ url }) => executeAnalyzePage(url),
});
