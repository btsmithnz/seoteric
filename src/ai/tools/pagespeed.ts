import { tool } from "ai";
import { z } from "zod";
import type { PageSpeedResult } from "@/app/api/pagespeed/_lib/pagespeed";
import { deploymentUrl } from "@/lib/env.server";

export interface PageSpeedOutput extends PageSpeedResult {
  error?: string;
}

export interface PageSpeedToolInput {
  strategy: "mobile" | "desktop";
  url: string;
}

interface PageSpeedToolCallbacks {
  beforeRun?: (input: PageSpeedToolInput) => Promise<void>;
  onSuccess?: (
    input: PageSpeedToolInput,
    output: PageSpeedResult
  ) => Promise<void>;
}

export function createRunPageSpeedTool(callbacks: PageSpeedToolCallbacks = {}) {
  return tool({
    description:
      "Run a full page load analysis using Google PageSpeed Insights. Returns Core Web Vitals (LCP, CLS, INP, FCP, TTFB), overall performance score, and improvement opportunities. Use this for detailed performance analysis - it takes 15-30 seconds but provides real browser metrics. For quick network checks, use runSpeedTest instead.",
    inputSchema: z.object({
      url: z.url().describe("The URL to analyze"),
      strategy: z
        .enum(["mobile", "desktop"])
        .default("mobile")
        .describe(
          "Test strategy. Mobile is the default and more important for SEO as Google uses mobile-first indexing."
        ),
    }),
    execute: async ({ url, strategy }) => {
      const apiKey = process.env.INTERNAL_API_KEY;
      const input = { url, strategy };

      if (!apiKey) {
        return { error: "PageSpeed API not configured" };
      }

      try {
        await callbacks.beforeRun?.(input);
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "PageSpeed limit reached",
        };
      }

      try {
        const response = await fetch(`${deploymentUrl}/api/pagespeed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const error = await response.json();
          return { error: error.error || `HTTP ${response.status}` };
        }

        const output = (await response.json()) as PageSpeedResult;
        await callbacks.onSuccess?.(input, output);

        return output;
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });
}

export const runPageSpeedTool = createRunPageSpeedTool();
