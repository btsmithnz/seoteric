import { tool } from "ai";
import { z } from "zod";

const TIMEOUT_MS = 10_000;

export const checkUrlStatusTool = tool({
  description:
    "Check if a URL is accessible by making a HEAD request. Returns status code, redirects, and response time. Useful for broken link detection.",
  inputSchema: z.object({
    url: z.url().describe("The URL to check"),
  }),
  execute: async ({ url }) => {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const redirectLocation = response.headers.get("location");

      return {
        url,
        status: response.status,
        statusText: response.statusText,
        accessible: response.status >= 200 && response.status < 400,
        isRedirect: response.status >= 300 && response.status < 400,
        redirectLocation,
        responseTimeMs: responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error instanceof Error && error.name === "AbortError") {
        return {
          url,
          status: null,
          accessible: false,
          error: `Request timed out after ${TIMEOUT_MS}ms`,
          responseTimeMs: responseTime,
        };
      }

      return {
        url,
        status: null,
        accessible: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTimeMs: responseTime,
      };
    }
  },
});
