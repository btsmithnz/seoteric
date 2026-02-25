import { tool } from "ai";
import { load } from "cheerio";
import { z } from "zod";
import { scrapingBeeFetch } from "@/lib/scrapingbee";

async function executeScrape(
  url: string,
  selectors: Record<string, string>
): Promise<Record<string, string[]> | { error: string }> {
  try {
    const html = await scrapingBeeFetch(url);
    const $ = load(html);

    const results: Record<string, string[]> = {};

    for (const [name, selector] of Object.entries(selectors)) {
      const matches: string[] = [];
      $(selector).each((_, el) => {
        const text = $(el).html() ?? $(el).text();
        if (text) {
          matches.push(text.trim());
        }
      });
      results[name] = matches;
    }

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      error: `Error scraping page: ${message}`,
    };
  }
}

export const scrapePageTool = tool({
  description:
    "Fetch a page's rendered HTML and extract content using CSS selectors. Use this to extract structured data (JSON-LD, microdata), or specific DOM elements. Pass named selectors to extract multiple pieces of content in one call.",
  inputSchema: z.object({
    url: z.url().describe("The URL of the page to scrape"),
    selectors: z
      .record(z.string(), z.string())
      .describe(
        'Named CSS selectors to extract content, e.g. { "jsonLd": "script[type=\'application/ld+json\']", "prices": ".price" }'
      ),
  }),
  execute: ({ url, selectors }) => executeScrape(url, selectors),
});
