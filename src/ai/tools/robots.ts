import { tool } from "ai";
import { z } from "zod";
import { cleanDomain } from "@/lib/utils";

interface RobotsDirective {
  userAgent: string;
  rules: {
    type: "allow" | "disallow";
    path: string;
  }[];
}

interface ParsedRobotsTxt {
  raw: string;
  directives: RobotsDirective[];
  sitemaps: string[];
}

function parseRobotsTxt(text: string): ParsedRobotsTxt {
  const lines = text.split("\n").map((line) => line.trim());
  const directives: RobotsDirective[] = [];
  const sitemaps: string[] = [];
  let currentDirective: RobotsDirective | null = null;

  for (const line of lines) {
    if (line.startsWith("#") || line === "") {
      continue;
    }

    const [key, ...valueParts] = line.split(":");
    const value = valueParts.join(":").trim();
    const keyLower = key.toLowerCase();

    if (keyLower === "user-agent") {
      if (currentDirective) {
        directives.push(currentDirective);
      }
      currentDirective = { userAgent: value, rules: [] };
    } else if (keyLower === "allow" && currentDirective) {
      currentDirective.rules.push({ type: "allow", path: value });
    } else if (keyLower === "disallow" && currentDirective) {
      currentDirective.rules.push({ type: "disallow", path: value });
    } else if (keyLower === "sitemap") {
      sitemaps.push(value);
    }
  }

  if (currentDirective) {
    directives.push(currentDirective);
  }

  return { raw: text, directives, sitemaps };
}

export const fetchRobotsTxtTool = tool({
  description:
    "Fetch and parse a site's robots.txt file to see crawling rules and sitemap locations",
  inputSchema: z.object({
    domain: z.string().describe("The site domain (e.g., 'example.com')"),
  }),
  execute: async ({ domain }) => {
    const url = `https://${cleanDomain(domain)}/robots.txt`;

    try {
      const response = await fetch(url);

      if (response.status === 404) {
        return {
          found: false,
          message: "No robots.txt found at this domain",
          url,
        };
      }

      if (!response.ok) {
        return {
          found: false,
          message: `Failed to fetch robots.txt: HTTP ${response.status}`,
          url,
        };
      }

      const text = await response.text();
      const parsed = parseRobotsTxt(text);

      return {
        found: true,
        url,
        ...parsed,
      };
    } catch (error) {
      return {
        found: false,
        message: `Error fetching robots.txt: ${error instanceof Error ? error.message : "Unknown error"}`,
        url,
      };
    }
  },
});
