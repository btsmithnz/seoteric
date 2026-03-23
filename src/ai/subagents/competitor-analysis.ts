import {
  type LanguageModel,
  readUIMessageStream,
  ToolLoopAgent,
  tool,
} from "ai";
import { z } from "zod";
import { analyzePageTool } from "../tools/analyze-page";
import { fastSearchTool } from "../tools/fast-search";
import { scrapePageTool } from "../tools/scrape-page";
import { checkTrustSignalsTool } from "../tools/trust-signals";
import type { SiteContextOptions } from "../types";

interface CompetitorAnalysisSubagentConfig {
  model: LanguageModel;
  saveMemory: (key: string, value: string) => Promise<void>;
}

export function createCompetitorAnalysisSubagent({
  model,
  saveMemory,
}: CompetitorAnalysisSubagentConfig) {
  return new ToolLoopAgent({
    model,
    instructions: `You are a competitor analysis specialist. Your job is to research a website's competitive landscape and produce a concise 150-200 word competitor analysis.

## Process
1. Run 3-5 searches using varied queries that combine the site's industry, location, and service terms. Examples:
   - "{industry} {location}"
   - "{industry} services near {location}"
   - "best {industry} {country}"
   - "{industry} companies {location}"
   - "top {industry} providers {location}"
   Use the site's country code for geo-targeting.
2. Collect competitor domains from organic and local results, excluding the site's own domain
3. Identify the 3-5 most frequently appearing competitor domains
4. Analyze the homepage of the top 2-3 competitors to understand their positioning (title, meta description, headings, content focus)
5. Optionally check trust signals on top competitors for domain authority context

## Output
Write a single 150-200 word competitor analysis covering:
- **Key competitors**: The top 3-5 competitor domains found across searches
- **Positioning**: How competitors position themselves (services, messaging, audience)
- **Local presence**: Any local competitors found via local results
- **Competitive landscape**: Overall market density and competition level

Be factual and specific. Do not speculate or use filler. Base everything on tool results.`,
    tools: {
      fastSearch: fastSearchTool,
      analyzePage: analyzePageTool,
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
        await saveMemory("competitor-analysis", event.text);
      }
    },
  });
}

export function createCompetitorAnalysisTool(
  subagent: ReturnType<typeof createCompetitorAnalysisSubagent>,
  options: SiteContextOptions
) {
  return tool({
    description:
      "Research the competitive landscape for this website, identifying top competitors, their positioning, and market density.",
    inputSchema: z.object({}),
    async *execute(_, { abortSignal }) {
      const result = await subagent.stream({
        prompt: "Analyze the competitive landscape",
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
