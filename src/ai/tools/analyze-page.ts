import { tool } from "ai";
import { z } from "zod";
import { dataforseoPost } from "@/lib/dataforseo";

interface DfsOnPageItem {
  checks: {
    is_redirect: boolean;
    is_broken: boolean;
    is_https: boolean;
    canonical_to_redirect: boolean;
    has_micromarkup: boolean;
    has_micromarkup_errors: boolean;
    no_image_alt: boolean;
    no_h1_tag: boolean;
  } | null;
  content: {
    plain_text_word_count: number;
    plain_text_rate: number;
    automated_readability_index: number | null;
    coleman_liau_readability_index: number | null;
    dale_chall_readability_index: number | null;
    flesch_kincaid_readability_index: number | null;
    smog_readability_index: number | null;
    description_to_content_consistency: number | null;
    title_to_content_consistency: number | null;
  } | null;
  meta: {
    title: string | null;
    description: string | null;
    canonical: string | null;
    robots: string | null;
    htags: { h1?: string[]; h2?: string[]; h3?: string[] } | null;
    social_media_tags: Record<string, string> | null;
    images_count: number;
    internal_links_count: number;
    external_links_count: number;
  } | null;
  resource_type: string;
  response_headers: Record<string, string> | null;
  status_code: number;
  url: string;
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

function mapItemToResult(
  item: DfsOnPageItem,
  url: string,
  indexabilityIssues: string[]
) {
  const {
    title = null,
    description: metaDescription = null,
    canonical = null,
    robots: metaRobots = null,
    htags = null,
    social_media_tags: socialMediaTags = null,
    images_count: imagesCount = 0,
    internal_links_count: internalLinksCount = 0,
    external_links_count: externalLinksCount = 0,
  } = item.meta ?? {};

  const {
    plain_text_word_count: wordCount = 0,
    plain_text_rate: textToHtmlRatio = null,
    flesch_kincaid_readability_index: fleschKincaid = null,
    automated_readability_index: automatedReadabilityIndex = null,
    coleman_liau_readability_index: colemanLiau = null,
    dale_chall_readability_index: daleChall = null,
    smog_readability_index: smog = null,
    description_to_content_consistency: descriptionConsistency = null,
    title_to_content_consistency: titleConsistency = null,
  } = item.content ?? {};

  const {
    is_redirect: isRedirect = false,
    is_https: isHttps = false,
    has_micromarkup: hasMicromarkup = false,
    has_micromarkup_errors: hasMicromarkupErrors = false,
    no_image_alt: hasImagesWithoutAlt = false,
    no_h1_tag: noH1Tag = false,
  } = item.checks ?? {};

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
      title: socialMediaTags?.["og:title"] ?? null,
      description: socialMediaTags?.["og:description"] ?? null,
      image: socialMediaTags?.["og:image"] ?? null,
      url: socialMediaTags?.["og:url"] ?? null,
      type: socialMediaTags?.["og:type"] ?? null,
    },
    headings: {
      h1: htags?.h1 ?? [],
      h2: (htags?.h2 ?? []).slice(0, 20),
      h3: (htags?.h3 ?? []).slice(0, 20),
      noH1Tag,
    },
    links: {
      internalCount: internalLinksCount,
      externalCount: externalLinksCount,
    },
    images: { totalCount: imagesCount, hasImagesWithoutAlt },
    wordCount,
    readability: {
      fleschKincaid,
      automatedReadabilityIndex,
      colemanLiau,
      daleChall,
      smog,
    },
    contentConsistency: {
      titleToContent: titleConsistency,
      descriptionToContent: descriptionConsistency,
    },
    textToHtmlRatio,
    structuredData: {
      present: hasMicromarkup,
      hasErrors: hasMicromarkupErrors,
    },
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
          load_resources: true,
          enable_javascript: true,
          validate_micromarkup: true,
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
    return mapItemToResult(item, url, indexabilityIssues);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Error analyzing page: ${message}` };
  }
}

export const analyzePageTool = tool({
  description:
    "Comprehensive page analysis covering on-page SEO (title, meta, headings, link counts, images), content quality (word count, readability scores, content consistency), and indexability (HTTP status, robots directives, canonical, redirects). Reports whether structured data markup is present and has errors, but does not extract the actual markup content — use scrapePage for that.",
  inputSchema: z.object({
    url: z.url().describe("The URL of the page to analyze"),
  }),
  execute: ({ url }) => executeAnalyzePage(url),
});
