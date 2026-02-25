import { ToolLoopAgent } from "ai";
import { z } from "zod";
import { analyzePageTool } from "./tools/analyze-page";
import { googleSerpTool } from "./tools/google-serp";
import { checkKeywordCannibalizationTool } from "./tools/keyword-cannibalization";
import { checkUrlStatusTool } from "./tools/link-checker";
import {
  type createRunPageSpeedTool,
  runPageSpeedTool as defaultRunPageSpeedTool,
} from "./tools/pagespeed";
import {
  createRecommendationTool,
  updateRecommendationTool,
} from "./tools/recommendations";
import { fetchRobotsTxtTool } from "./tools/robots";
import { scrapePageTool } from "./tools/scrape-page";
import { checkSecurityHeadersTool } from "./tools/security-headers";
import { fetchSitemapTool } from "./tools/sitemap";
import { checkTrustSignalsTool } from "./tools/trust-signals";

const existingRecommendationSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  pageUrl: z.string().optional(),
});

interface SeoAgentConfig {
  model: "anthropic/claude-haiku-4.5" | "anthropic/claude-sonnet-4.5";
  runPageSpeedTool?: ReturnType<typeof createRunPageSpeedTool>;
}

export function createSeoAgent({
  model,
  runPageSpeedTool = defaultRunPageSpeedTool,
}: SeoAgentConfig) {
  return new ToolLoopAgent({
    model,
    instructions: `You are Seoteric, an AI assistant specializing in SEO (Search Engine Optimization). You help users understand and improve their website's search engine visibility. You provide clear, actionable advice and thorough audits. Keep responses concise and practical. Summarise tool call results instead of returning all the data - we visualise the data in the UI.

## SEO Audit Framework

When auditing a site, work through these areas in priority order:

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

### 4. Mobile & Security
- Confirm responsive design works across device sizes
- Verify HTTPS is enforced across the entire site with a valid SSL certificate

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
- **Local business**: inconsistent NAP (name, address, phone) data, missing location pages, unoptimised Google Business Profile`,
    tools: {
      fetchRobotsTxt: fetchRobotsTxtTool,
      fetchSitemap: fetchSitemapTool,
      checkUrlStatus: checkUrlStatusTool,
      analyzePage: analyzePageTool,
      createRecommendation: createRecommendationTool,
      updateRecommendation: updateRecommendationTool,
      runPageSpeed: runPageSpeedTool,
      checkSecurityHeaders: checkSecurityHeadersTool,
      checkTrustSignals: checkTrustSignalsTool,
      checkKeywordCannibalization: checkKeywordCannibalizationTool,
      googleSerp: googleSerpTool,
      scrapePage: scrapePageTool,
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
      existingRecommendations: z.array(existingRecommendationSchema),
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

      if (options.existingRecommendations.length > 0) {
        instructions += `\n\nExisting recommendations (avoid creating duplicates):
${options.existingRecommendations
  .map(
    (r) =>
      `- [${r._id}] ${r.title} (${r.priority}, ${r.status})${r.pageUrl ? ` - ${r.pageUrl}` : ""}`
  )
  .join("\n")}

When the user mentions fixing something, use updateRecommendation to mark the relevant recommendation as completed.`;
      }

      return { ...settings, instructions };
    },
  });
}

export const seoAgent = createSeoAgent({
  model: "anthropic/claude-sonnet-4.5",
});
