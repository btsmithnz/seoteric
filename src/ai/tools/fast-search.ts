import { tool } from "ai";
import { z } from "zod";
import { scrapingBeeFastSearch } from "@/lib/scrapingbee";

export const fastSearchTool = tool({
  description:
    "Search Google using ScrapingBee's Fast Search API. Returns organic results with titles, URLs, and descriptions. Use this to discover competitors by searching for industry and location specific terms.",
  inputSchema: z.object({
    query: z.string().describe("The Google search query"),
    countryCode: z
      .string()
      .optional()
      .describe(
        "2-letter country code for geo-targeting (e.g. 'us', 'gb', 'au'). Defaults to no targeting."
      ),
  }),
  execute: async ({ query, countryCode }) => {
    try {
      const data = await scrapingBeeFastSearch(query, countryCode);

      return {
        organicResults: data.organic_results.map((r) => ({
          url: r.url,
          title: r.title,
          description: r.description,
        })),
        localResults: data.local_results?.map((r) => ({
          title: r.title,
          rating: r.review,
          reviewCount: r.review_count,
        })),
        totalResults: data.meta_data.number_of_results,
      };
    } catch (error) {
      return {
        error: `Error searching Google: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
