import { tool } from "ai";
import { z } from "zod";

const REGIONS = ["iad1", "sfo1", "lhr1", "hnd1", "sin1", "syd1"] as const;

export const runSpeedTestTool = tool({
  description:
    "Run a speed test on a URL from multiple global regions. Returns TTFB (Time to First Byte), total load time, response size, and headers. Useful for diagnosing performance issues and CDN effectiveness.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to test"),
    regions: z
      .union([z.literal("all"), z.array(z.enum(REGIONS))])
      .default("all")
      .describe(
        "Regions to test from. Use 'all' for global coverage or specify specific regions like ['iad1', 'sfo1']."
      ),
  }),
  execute: async ({ url, regions }) => {
    const baseUrl = process.env.PROD_SITE_URL;
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!baseUrl || !apiKey) {
      return { error: "Speed test API not configured" };
    }

    try {
      const response = await fetch(`${baseUrl}/api/speed-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ url, regions }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || `HTTP ${response.status}` };
      }

      return await response.json();
    } catch (error) {
      return {
        error: `Speed test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
