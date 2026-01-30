import { tool } from "ai";
import { z } from "zod";
import { load } from "cheerio";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface SitemapResult {
  type: "urlset" | "sitemapindex";
  urls?: SitemapUrl[];
  sitemaps?: string[];
  total: number;
  truncated: boolean;
}

const MAX_URLS = 100;

function parseSitemap(xml: string): SitemapResult {
  const $ = load(xml, { xmlMode: true });

  // Check if it's a sitemap index
  const sitemapLocs = $("sitemapindex sitemap loc");
  if (sitemapLocs.length > 0) {
    const sitemaps = sitemapLocs
      .map((_, el) => $(el).text())
      .get()
      .slice(0, MAX_URLS);

    return {
      type: "sitemapindex",
      sitemaps,
      total: sitemapLocs.length,
      truncated: sitemapLocs.length > MAX_URLS,
    };
  }

  // Parse as regular urlset
  const urlElements = $("urlset url");
  const urls: SitemapUrl[] = urlElements
    .map((_, el) => {
      const $el = $(el);
      const entry: SitemapUrl = {
        loc: $el.find("loc").text(),
      };

      const lastmod = $el.find("lastmod").text();
      if (lastmod) entry.lastmod = lastmod;

      const changefreq = $el.find("changefreq").text();
      if (changefreq) entry.changefreq = changefreq;

      const priority = $el.find("priority").text();
      if (priority) entry.priority = priority;

      return entry;
    })
    .get()
    .slice(0, MAX_URLS);

  return {
    type: "urlset",
    urls,
    total: urlElements.length,
    truncated: urlElements.length > MAX_URLS,
  };
}

export const fetchSitemapTool = tool({
  description:
    "Fetch and parse a site's XML sitemap to list indexed pages. Handles both regular sitemaps and sitemap index files.",
  inputSchema: z.object({
    url: z
      .string()
      .describe(
        "The sitemap URL - can be a path like '/sitemap.xml' or a full URL"
      ),
    domain: z
      .string()
      .optional()
      .describe("The domain to use if url is a relative path"),
  }),
  execute: async ({ url, domain }) => {
    let fullUrl = url;

    // If url is a relative path, prepend the domain
    if (url.startsWith("/")) {
      if (!domain) {
        return {
          success: false,
          error: "Domain is required when url is a relative path",
        };
      }
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      fullUrl = `https://${cleanDomain}${url}`;
    }

    // Ensure https
    if (!fullUrl.startsWith("http")) {
      fullUrl = `https://${fullUrl}`;
    }

    try {
      const response = await fetch(fullUrl);

      if (response.status === 404) {
        return {
          success: false,
          error: "Sitemap not found",
          url: fullUrl,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch sitemap: HTTP ${response.status}`,
          url: fullUrl,
        };
      }

      const xml = await response.text();
      const parsed = parseSitemap(xml);

      return {
        success: true,
        url: fullUrl,
        ...parsed,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error fetching sitemap: ${error instanceof Error ? error.message : "Unknown error"}`,
        url: fullUrl,
      };
    }
  },
});
