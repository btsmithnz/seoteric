import { type LanguageModel, ToolLoopAgent } from "ai";
import { z } from "zod";
import { analyzePageTool } from "../tools/analyze-page";
import { googleSerpTool } from "../tools/google-serp";
import { scrapePageTool } from "../tools/scrape-page";
import { fetchSitemapTool } from "../tools/sitemap";
import { checkTrustSignalsTool } from "../tools/trust-signals";

interface BusinessReviewSubagentConfig {
  model: LanguageModel;
  saveMemory: (key: string, value: string) => Promise<void>;
}

export function createBusinessReviewSubagent({
  model,
  saveMemory,
}: BusinessReviewSubagentConfig) {
  return new ToolLoopAgent({
    model,
    instructions: `You are a business analyst. Your job is to research a website and produce a concise 150-200 word description of the business.

## Process
1. Scrape the homepage to understand what the business does (extract nav links, hero text, JSON-LD structured data)
2. Fetch the sitemap to understand site structure and main pages
3. Analyze the homepage for SEO metadata (title, description, headings)
4. Check SERP rankings for the business name to see how it appears in search
5. Check trust signals for domain authority context

## Output
Write a single 150-200 word description covering:
- **Business**: What the company does, its products/services
- **Market**: Industry, target audience, competitive positioning
- **Location**: Where the business operates (use site context + any signals from the site)
- **Site overview**: Main sections/pages, site structure, how it ranks for its brand name

Be factual and specific. Do not speculate or use filler. Base everything on tool results.`,
    tools: {
      analyzePage: analyzePageTool,
      googleSerp: googleSerpTool,
      fetchSitemap: fetchSitemapTool,
      scrapePage: scrapePageTool,
      checkTrustSignals: checkTrustSignalsTool,
    },
    callOptionsSchema: z.object({
      siteDomain: z.string(),
      siteName: z.string(),
      siteCountry: z.string(),
      siteIndustry: z.string(),
      siteLocation: z.string().optional(),
      siteLatitude: z.number().optional(),
      siteLongitude: z.number().optional(),
      siteGoogleLocationId: z.number().optional(),
    }),
    prepareCall: ({ options, ...settings }) => {
      let instructions =
        settings.instructions +
        `\nSite context:
- Site Name: ${options.siteName}
- Site Domain: ${options.siteDomain}
- Site Country: ${options.siteCountry}
- Site Industry: ${options.siteIndustry}`;

      if (options.siteLocation) {
        instructions += `\n- Site Location: ${options.siteLocation}`;
      }
      if (
        options.siteLatitude !== undefined &&
        options.siteLongitude !== undefined
      ) {
        instructions += `\n- Coordinates: ${options.siteLatitude}, ${options.siteLongitude}`;
      }
      if (options.siteGoogleLocationId !== undefined) {
        instructions += `\n- Google Location ID: ${options.siteGoogleLocationId}`;
      }

      return { ...settings, instructions };
    },
    onFinish: async (event) => {
      if (event.text) {
        await saveMemory("business-review", event.text);
      }
    },
  });
}
