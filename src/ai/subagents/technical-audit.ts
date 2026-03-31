import {
  type LanguageModel,
  readUIMessageStream,
  ToolLoopAgent,
  tool,
} from "ai";
import { z } from "zod";
import { MEMORY_KEYS } from "../memory-keys";
import type { ExistingRecommendation } from "../schemas";
import {
  existingRecommendationSchema,
  type SiteContext,
  siteContextSchema,
} from "../schemas";
import { analyzePageTool } from "../tools/analyze-page";
import { googleSerpTool } from "../tools/google-serp";
import { checkKeywordCannibalizationTool } from "../tools/keyword-cannibalization";
import { checkUrlStatusTool } from "../tools/link-checker";
import type { createRecallMemoriesTool } from "../tools/memory";
import {
  type createRunPageSpeedTool,
  runPageSpeedTool as defaultRunPageSpeedTool,
} from "../tools/pagespeed";
import { createRecommendationTool } from "../tools/recommendations";
import { fetchRobotsTxtTool } from "../tools/robots";
import { scrapePageTool } from "../tools/scrape-page";
import { fetchSitemapTool } from "../tools/sitemap";
import { checkTrustSignalsTool } from "../tools/trust-signals";

interface TechnicalAuditSubagentConfig {
  loadMemory: () => Promise<string | null>;
  model: LanguageModel;
  recallMemoriesTool: ReturnType<typeof createRecallMemoriesTool>;
  runPageSpeedTool?: ReturnType<typeof createRunPageSpeedTool>;
  saveMemory: (key: string, value: string) => Promise<void>;
}

export function createTechnicalAuditSubagent({
  model,
  saveMemory,
  recallMemoriesTool,
  loadMemory,
  runPageSpeedTool = defaultRunPageSpeedTool,
}: TechnicalAuditSubagentConfig) {
  return new ToolLoopAgent({
    model,
    instructions: `You are a technical SEO auditor. Your job is to perform a comprehensive technical audit of a website, identify issues, and create actionable recommendations.

## Process

Work through these areas in priority order. Use the available tools to gather data, then create a recommendation for each distinct issue found.

### 1. Crawlability & Indexation (highest priority)
- Verify robots.txt isn't unintentionally blocking important pages or resources
- Check XML sitemap is accessible, valid, and submitted to search engines
- Assess site architecture — key pages should be reachable within 3 clicks
- Look for noindex tags, redirect chains, and duplicate content without proper canonicals
- Check index status: compare expected pages vs. what's likely indexed

### 2. Canonicalization & URL Consistency
- Confirm self-referencing canonicals on unique pages
- Enforce a single protocol (HTTPS) and subdomain (www vs. non-www) consistently
- Flag redirect chains and loops

### 3. Core Web Vitals & Performance
- LCP (Largest Contentful Paint) target: <2.5s
- INP (Interaction to Next Paint) target: <200ms
- CLS (Cumulative Layout Shift) target: <0.1
- Check TTFB, image optimisation, JavaScript execution time, caching headers, and CDN usage

### 4. Mobile Friendliness
- Confirm responsive design works across device sizes
- Verify the site uses HTTPS (note: don't create recommendations about specific security headers like CSP or X-Frame-Options — these are web security concerns, not SEO issues)

### 5. On-Page SEO
- Title tags: unique, 50–60 characters, primary keyword near the start
- Meta descriptions: unique, 150–160 characters, include a value proposition
- Heading structure: single H1 per page, logical H2/H3 hierarchy
- Keyword placement: target keyword appears in first 100 words of content
- Alt text: descriptive and keyword-relevant on all meaningful images
- Internal linking: strategic use with descriptive anchor text
- URL structure: short, descriptive, includes keywords where natural

### 6. Content Quality & E-E-A-T
Evaluate Experience, Expertise, Authoritativeness, and Trustworthiness signals:
- Experience: first-hand insights and original perspectives
- Expertise: author credentials, depth of coverage
- Authoritativeness: industry recognition, citations, backlinks
- Trustworthiness: transparent contact info, HTTPS, clear policies
- Flag thin content, outdated articles, and keyword cannibalization

### 7. Structured Data
- Check whether structured data markup is present using analyzePage (reports presence and error flags)
- Use scrapePage to extract the actual structured data content (JSON-LD via script[type='application/ld+json'], microdata) when you need to inspect or validate the markup itself

### 8. SERP Visibility
- Use googleSerp to check current Google rankings for the site's target keywords
- Always pass siteGoogleLocationId as locationCode for locale-accurate results
- Identify where the site's domain appears in topResults; report position or "not found in top N"
- Note serpFeatures (paid, featured_snippet) that push organic results down
- Use topDomains to identify direct SERP competitors for the query

### Industry-Specific Watchpoints
- **SaaS**: shallow product pages, blog content not integrated with product, missing comparison pages
- **E-commerce**: thin category pages, duplicate product descriptions, faceted navigation creating duplicate URLs
- **Content sites**: outdated articles, keyword cannibalization, weak internal linking
- **Local business**: inconsistent NAP (name, address, phone) data, missing location pages, unoptimised Google Business Profile

## Creating Recommendations
- Create a recommendation for each distinct issue found
- Check existing recommendations to avoid duplicates
- Track recommendations you create during this audit to avoid creating duplicates within the same run
- Use appropriate priorities: critical for blocking issues, high for significant impact, medium for moderate improvements, low for nice-to-haves

## Output
After completing the audit and creating recommendations, provide a brief executive summary covering:
- Overall site health assessment
- Number of issues found by priority
- Top 3 most impactful areas for improvement
- Any quick wins identified`,
    tools: {
      fetchRobotsTxt: fetchRobotsTxtTool,
      fetchSitemap: fetchSitemapTool,
      checkUrlStatus: checkUrlStatusTool,
      analyzePage: analyzePageTool,
      runPageSpeed: runPageSpeedTool,
      checkTrustSignals: checkTrustSignalsTool,
      checkKeywordCannibalization: checkKeywordCannibalizationTool,
      googleSerp: googleSerpTool,
      scrapePage: scrapePageTool,
      createRecommendation: createRecommendationTool,
      recallMemories: recallMemoriesTool,
    },
    callOptionsSchema: siteContextSchema.extend({
      existingRecommendations: z.array(existingRecommendationSchema),
    }),
    prepareCall: async ({ options, ...settings }) => {
      const memory = await loadMemory();

      let instructions =
        settings.instructions +
        `\nSite context:
- Site Name: ${options.siteName}
- Site Domain: ${options.siteDomain}
- Site Country: ${options.siteCountry}
- Site Industry: ${options.siteIndustry}`;

      if (options.siteObjective) {
        instructions += `\n- Site Objective: ${options.siteObjective}`;
      }

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

      if (options.existingRecommendations.length > 0) {
        instructions += `\n\nExisting recommendations (avoid creating duplicates):
${options.existingRecommendations
  .map(
    (r) =>
      `- [${r._id}] ${r.title} (${r.priority}, ${r.status})${r.pageUrl ? ` - ${r.pageUrl}` : ""}`
  )
  .join("\n")}`;
      }

      if (memory) {
        instructions += `\n\n## Prior technical audit memory:\n${memory}`;
      }

      return { ...settings, instructions };
    },
    onFinish: async (event) => {
      if (event.text) {
        await saveMemory(MEMORY_KEYS.TECHNICAL_AUDIT, event.text);
      }
    },
  });
}

export function createTechnicalAuditTool(
  subagent: ReturnType<typeof createTechnicalAuditSubagent>,
  options: SiteContext & { existingRecommendations: ExistingRecommendation[] }
) {
  return tool({
    description:
      "Perform a comprehensive technical SEO audit of the website, covering crawlability, performance, on-page SEO, structured data, and more. Automatically creates recommendations for issues found.",
    inputSchema: z.object({}),
    async *execute(_, { abortSignal }) {
      const result = await subagent.stream({
        prompt: "Perform a comprehensive technical SEO audit of this website.",
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
