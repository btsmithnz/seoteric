import { tool } from "ai";
import { SerpGoogleOrganicLiveRegularRequestInfo } from "dataforseo-client";
import { z } from "zod";
import { createSerpApi } from "@/lib/dataforseo";

export const googleSerpTool = tool({
  description:
    "Check Google SERP rankings for a keyword. Returns where (if at all) the site's domain appears in results, top competing domains, and SERP features that may affect organic visibility. Always pass siteGoogleLocationId as locationCode.",
  inputSchema: z.object({
    keyword: z.string().describe("The search query to look up"),
    locationCode: z
      .number()
      .optional()
      .describe(
        "DataForSEO location_code for locale targeting. Use siteGoogleLocationId. Defaults to 2840 (United States)."
      ),
    depth: z
      .number()
      .optional()
      .describe("Results to fetch (10–20). Default: 10."),
  }),
  execute: async ({ keyword, locationCode, depth }) => {
    try {
      const clampedDepth = Math.min(Math.max(depth ?? 10, 10), 20);
      const serpApi = createSerpApi();
      const response = await serpApi.googleOrganicLiveRegular([
        new SerpGoogleOrganicLiveRegularRequestInfo({
          keyword,
          language_code: "en",
          depth: clampedDepth,
          location_code: locationCode ?? 2840,
        }),
      ]);
      const task = response?.tasks?.[0];
      if (task?.status_code !== 20_000) {
        return { error: `DataForSEO SERP error: ${task?.status_message}` };
      }
      const result = task.result?.[0];
      if (!result) {
        return { error: "No SERP data returned" };
      }

      const organic = (result.items ?? []).filter((i) => i.type === "organic");
      return {
        keyword: result.keyword,
        locationCode: locationCode ?? 2840,
        totalEstimatedResults: result.se_results_count,
        serpFeatures: (result.item_types ?? []).filter((t) => t !== "organic"),
        topResults: organic.map((i) => ({
          rank: i.rank_group,
          domain: i.domain,
          title: i.title,
          url: i.url,
          description: i.description,
        })),
        topDomains: [...new Set(organic.map((i) => i.domain).filter(Boolean))],
      };
    } catch (error) {
      return {
        error: `Error fetching SERP: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
