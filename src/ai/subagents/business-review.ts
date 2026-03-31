import {
  type LanguageModel,
  readUIMessageStream,
  ToolLoopAgent,
  tool,
} from "ai";
import { z } from "zod";
import { MEMORY_KEYS } from "../memory-keys";
import { type SiteContext, siteContextSchema } from "../schemas";
import { analyzePageTool } from "../tools/analyze-page";
import { googleSerpTool } from "../tools/google-serp";
import type { createRecallMemoriesTool } from "../tools/memory";
import { scrapePageTool } from "../tools/scrape-page";
import { fetchSitemapTool } from "../tools/sitemap";
import { checkTrustSignalsTool } from "../tools/trust-signals";

interface BusinessReviewSubagentConfig {
  loadMemory: () => Promise<string | null>;
  model: LanguageModel;
  recallMemoriesTool: ReturnType<typeof createRecallMemoriesTool>;
  saveMemory: (key: string, value: string) => Promise<void>;
}

export function createBusinessReviewSubagent({
  model,
  saveMemory,
  recallMemoriesTool,
  loadMemory,
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
      recallMemories: recallMemoriesTool,
    },
    callOptionsSchema: siteContextSchema,
    prepareCall: async ({ options, ...settings }) => {
      const memory = await loadMemory();

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

      if (memory) {
        instructions += `\n\n## Prior business review memory:\n${memory}`;
      }

      return { ...settings, instructions };
    },
    onFinish: async (event) => {
      if (event.text) {
        await saveMemory(MEMORY_KEYS.BUSINESS_REVIEW, event.text);
      }
    },
  });
}

export function createBusinessReviewTool(
  subagent: ReturnType<typeof createBusinessReviewSubagent>,
  options: SiteContext
) {
  return tool({
    description:
      "Research the website and produce a business overview covering what the business does, its market, location, and site structure.",
    inputSchema: z.object({}),
    async *execute(_, { abortSignal }) {
      const result = await subagent.stream({
        prompt: "Review this business",
        options,
        abortSignal,
      });
      for await (const message of readUIMessageStream({
        stream: result.toUIMessageStream(),
      })) {
        yield message;
      }
    },
    toModelOutput: ({ output: message }) => {
      const lastTextPart = message?.parts.findLast((p) => p.type === "text");
      return {
        type: "text" as const,
        value: lastTextPart?.text ?? "Task completed.",
      };
    },
  });
}
