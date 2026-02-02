import { tool } from "ai";
import { z } from "zod";
import type { SpeedTestRegionResult } from "@/app/api/speed-test/_lib/speed-test";
import { deploymentUrl } from "@/lib/env";

export interface SpeedTestOutput {
  url: string;
  results: SpeedTestRegionResult[];
  error?: string;
}

const REGIONS = ["iad1", "sfo1", "lhr1", "hnd1", "sin1", "syd1"] as const;

export const runSpeedTestTool = tool({
  description:
    "Run a quick network speed test on a URL from multiple global regions. Returns TTFB (Time to First Byte), total load time, response size, and headers. Good for diagnosing CDN effectiveness and basic network latency (~500ms). For detailed Core Web Vitals and full page load analysis, use runPageSpeed instead.",
  inputSchema: z.object({
    url: z.url().describe("The URL to test"),
    regions: z
      .union([z.literal("all"), z.array(z.enum(REGIONS))])
      .default("all")
      .describe(
        "Regions to test from. Use 'all' for global coverage or specify specific regions like ['iad1', 'sfo1']."
      ),
  }),
  execute: async ({ url, regions }) => {
    const apiKey = process.env.INTERNAL_API_KEY;

    if (!apiKey) {
      return { error: "Speed test API not configured" };
    }

    try {
      const response = await fetch(`${deploymentUrl}/api/speed-test`, {
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
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
