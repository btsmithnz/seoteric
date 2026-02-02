import { tool } from "ai";
import { type CheerioAPI, load } from "cheerio";
import { z } from "zod";

interface RedirectStep {
  url: string;
  status: number;
}

interface CanonicalData {
  url: string | null;
  isSelfReferencing: boolean;
}

interface IndexabilityResult {
  url: string;
  indexable: boolean;
  issues: string[];
  metaRobots: string | null;
  xRobotsTag: string | null;
  canonical: CanonicalData;
  httpStatus: number;
  redirectChain: RedirectStep[];
}

const MAX_REDIRECTS = 5;
const NOINDEX_DIRECTIVES = ["noindex", "none"];

function parseRobotsDirectives(content: string): string[] {
  return content
    .toLowerCase()
    .split(",")
    .map((d) => d.trim());
}

function hasNoindexDirective(directives: string[]): boolean {
  return directives.some((d) => NOINDEX_DIRECTIVES.includes(d));
}

function checkNoindexInContent(
  content: string | null,
  source: string
): { hasNoindex: boolean; issue: string | null } {
  if (!content) {
    return { hasNoindex: false, issue: null };
  }
  const directives = parseRobotsDirectives(content);
  if (hasNoindexDirective(directives)) {
    return {
      hasNoindex: true,
      issue: `${source} contains noindex directive: "${content}"`,
    };
  }
  return { hasNoindex: false, issue: null };
}

function analyzeCanonical(
  $: CheerioAPI,
  finalUrl: string
): { canonical: CanonicalData; issue: string | null } {
  const canonicalHref = $('link[rel="canonical"]').attr("href") || null;

  if (!canonicalHref) {
    return {
      canonical: { url: null, isSelfReferencing: false },
      issue: "Missing canonical tag",
    };
  }

  const canonicalUrl = new URL(canonicalHref, finalUrl).href;
  const isSelfReferencing = canonicalUrl === finalUrl;

  const issue = isSelfReferencing
    ? null
    : `Canonical points to different URL: "${canonicalUrl}" (current: "${finalUrl}")`;

  return {
    canonical: { url: canonicalUrl, isSelfReferencing },
    issue,
  };
}

function analyzeRedirectChain(redirectChain: RedirectStep[]): {
  issues: string[];
} {
  const issues: string[] = [];

  if (redirectChain.length > 2) {
    issues.push(`Long redirect chain: ${redirectChain.length} hops`);
  }

  const hasTemporaryRedirects = redirectChain.some(
    (r) => r.status === 302 || r.status === 307
  );
  if (hasTemporaryRedirects && redirectChain.length > 0) {
    issues.push(
      "Redirect chain contains temporary redirects (302/307) - consider using permanent redirects (301/308)"
    );
  }

  return { issues };
}

async function followRedirects(
  startUrl: string
): Promise<{ finalResponse: Response; redirectChain: RedirectStep[] }> {
  const redirectChain: RedirectStep[] = [];
  let currentUrl = startUrl;

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    const response = await fetch(currentUrl, { redirect: "manual" });
    const status = response.status;

    if (status >= 300 && status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        return { finalResponse: response, redirectChain };
      }

      redirectChain.push({ url: currentUrl, status });
      currentUrl = new URL(location, currentUrl).href;
    } else {
      if (redirectChain.length > 0) {
        redirectChain.push({ url: currentUrl, status });
      }
      return { finalResponse: response, redirectChain };
    }
  }

  const finalResponse = await fetch(currentUrl, { redirect: "manual" });
  redirectChain.push({ url: currentUrl, status: finalResponse.status });
  return { finalResponse, redirectChain };
}

export const checkIndexabilityTool = tool({
  description:
    "Check if a URL is indexable by search engines. Detects noindex directives, X-Robots-Tag headers, canonical issues, and redirect chains.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to check for indexability"),
  }),
  execute: async ({ url }): Promise<IndexabilityResult | { error: string }> => {
    try {
      const { finalResponse, redirectChain } = await followRedirects(url);
      const issues: string[] = [];
      let indexable = true;

      const httpStatus = finalResponse.status;
      if (httpStatus >= 400) {
        issues.push(`HTTP error status: ${httpStatus}`);
        indexable = false;
      }

      const xRobotsTag = finalResponse.headers.get("x-robots-tag");
      const xRobotsCheck = checkNoindexInContent(
        xRobotsTag,
        "X-Robots-Tag header"
      );
      if (xRobotsCheck.hasNoindex) {
        issues.push(xRobotsCheck.issue as string);
        indexable = false;
      }

      const html = await finalResponse.text();
      const $ = load(html);

      const metaRobots =
        $('meta[name="robots"]').attr("content") ||
        $('meta[name="googlebot"]').attr("content") ||
        null;
      const metaCheck = checkNoindexInContent(metaRobots, "Meta robots");
      if (metaCheck.hasNoindex) {
        issues.push(metaCheck.issue as string);
        indexable = false;
      }

      const finalUrl =
        redirectChain.length > 0 ? (redirectChain.at(-1)?.url ?? url) : url;
      const { canonical, issue: canonicalIssue } = analyzeCanonical(
        $,
        finalUrl
      );
      if (canonicalIssue) {
        issues.push(canonicalIssue);
      }

      const { issues: redirectIssues } = analyzeRedirectChain(redirectChain);
      issues.push(...redirectIssues);

      return {
        url,
        indexable,
        issues,
        metaRobots,
        xRobotsTag,
        canonical,
        httpStatus,
        redirectChain,
      };
    } catch (error) {
      return {
        error: `Error checking indexability: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
