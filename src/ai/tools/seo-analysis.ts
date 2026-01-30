import { tool } from "ai";
import { z } from "zod";
import { load, type CheerioAPI } from "cheerio";

const MAX_LINKS = 50;
const MAX_IMAGES = 50;

interface LinkData {
  href: string;
  text: string;
}

interface PageSeoData {
  url: string;
  title: string;
  metaDescription: string | null;
  canonical: string | null;
  ogTags: { property: string; content: string }[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  links: {
    internal: LinkData[];
    external: LinkData[];
  };
  images: { src: string; alt: string | null }[];
  wordCount: number;
  jsonLd: object[] | null;
}

function extractLinks(
  $: CheerioAPI,
  baseUrl: URL
): { internal: LinkData[]; external: LinkData[] } {
  const internal: LinkData[] = [];
  const external: LinkData[] = [];

  $("a[href]").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");
    if (!href) return;

    const text = $el.text().trim().slice(0, 100);

    try {
      const linkUrl = new URL(href, baseUrl);

      // Skip non-http links
      if (!linkUrl.protocol.startsWith("http")) return;

      const linkData = { href: linkUrl.href, text };

      if (linkUrl.hostname === baseUrl.hostname) {
        if (internal.length < MAX_LINKS) internal.push(linkData);
      } else {
        if (external.length < MAX_LINKS) external.push(linkData);
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return { internal, external };
}

function extractImages($: CheerioAPI, baseUrl: URL) {
  const images: { src: string; alt: string | null }[] = [];

  $("img[src]").each((_, el) => {
    if (images.length >= MAX_IMAGES) return;

    const $el = $(el);
    const src = $el.attr("src");
    if (!src) return;

    try {
      const imgUrl = new URL(src, baseUrl);
      images.push({
        src: imgUrl.href,
        alt: $el.attr("alt") || null,
      });
    } catch {
      // Invalid URL, skip
    }
  });

  return images;
}

function extractJsonLd($: CheerioAPI): object[] | null {
  const scripts: object[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        scripts.push(parsed);
      }
    } catch {
      // Invalid JSON, skip
    }
  });

  return scripts.length > 0 ? scripts : null;
}

function countWords($: CheerioAPI): number {
  // Remove script and style content
  const $clone = $.root().clone();
  $clone.find("script, style, noscript").remove();

  const text = $clone.find("body").text();
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

export const getPageSeoDataTool = tool({
  description:
    "Fetch comprehensive SEO data from a page including title, meta tags, headings, links, images, and structured data. Use this for detailed SEO analysis.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL of the page to analyze"),
  }),
  execute: async ({ url }): Promise<PageSeoData | { error: string }> => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        return { error: `Failed to fetch page: HTTP ${response.status}` };
      }

      const html = await response.text();
      const $ = load(html);
      const baseUrl = new URL(url);

      // Extract title
      const title = $("title").text().trim();

      // Extract meta description
      const metaDescription =
        $('meta[name="description"]').attr("content") || null;

      // Extract canonical
      const canonical = $('link[rel="canonical"]').attr("href") || null;

      // Extract Open Graph tags
      const ogTags: { property: string; content: string }[] = [];
      $("meta[property^='og:']").each((_, el) => {
        const property = $(el).attr("property");
        const content = $(el).attr("content");
        if (property && content) {
          ogTags.push({ property, content });
        }
      });

      // Extract headings
      const headings = {
        h1: $("h1")
          .map((_, el) => $(el).text().trim())
          .get(),
        h2: $("h2")
          .map((_, el) => $(el).text().trim())
          .get()
          .slice(0, 20),
        h3: $("h3")
          .map((_, el) => $(el).text().trim())
          .get()
          .slice(0, 20),
      };

      // Extract links
      const links = extractLinks($, baseUrl);

      // Extract images
      const images = extractImages($, baseUrl);

      // Count words
      const wordCount = countWords($);

      // Extract JSON-LD
      const jsonLd = extractJsonLd($);

      return {
        url,
        title,
        metaDescription,
        canonical,
        ogTags,
        headings,
        links,
        images,
        wordCount,
        jsonLd,
      };
    } catch (error) {
      return {
        error: `Error analyzing page: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
