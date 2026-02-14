import { ToolLoopAgent } from "ai";
import { z } from "zod";
import { analyzeContentQualityTool } from "./tools/content-quality";
import { checkIndexabilityTool } from "./tools/indexability";
import { checkUrlStatusTool } from "./tools/link-checker";
import { runPageSpeedTool } from "./tools/pagespeed";
import {
  createRecommendationTool,
  updateRecommendationTool,
} from "./tools/recommendations";
import { fetchRobotsTxtTool } from "./tools/robots";
import { checkSecurityHeadersTool } from "./tools/security-headers";
import { getPageSeoDataTool } from "./tools/seo-analysis";
import { fetchSitemapTool } from "./tools/sitemap";
import { validateStructuredDataTool } from "./tools/structured-data";

const existingRecommendationSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  pageUrl: z.string().optional(),
});

const allTools = {
  fetchRobotsTxt: fetchRobotsTxtTool,
  fetchSitemap: fetchSitemapTool,
  checkUrlStatus: checkUrlStatusTool,
  getPageSeoData: getPageSeoDataTool,
  createRecommendation: createRecommendationTool,
  updateRecommendation: updateRecommendationTool,
  runPageSpeed: runPageSpeedTool,
  checkIndexability: checkIndexabilityTool,
  checkSecurityHeaders: checkSecurityHeadersTool,
  validateStructuredData: validateStructuredDataTool,
  analyzeContentQuality: analyzeContentQualityTool,
};

export const seoAgent = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-4.5",
  instructions: `You are Seoteric, an AI assistant specializing in SEO (Search Engine Optimization). You help users understand and improve their website's search engine visibility. You provide clear, actionable advice on topics like keyword research, on-page optimization, technical SEO, content strategy, and link building. Keep responses concise and practical. Summarise tool call results instead of returning all the data - we visualise the data in the UI.`,
  tools: allTools,
  callOptionsSchema: z.object({
    siteDomain: z.string(),
    siteName: z.string(),
    siteCountry: z.string(),
    siteIndustry: z.string(),
    existingRecommendations: z.array(existingRecommendationSchema),
    model: z.string().optional(),
    recommendationLimit: z.number().optional(),
    activeRecommendationCount: z.number().optional(),
    pageSpeedRemaining: z.number().optional(),
  }),
  prepareCall: ({ options, ...settings }) => {
    let instructions =
      settings.instructions +
      `\nSite context:
- Site Name: ${options.siteName}
- Site Domain: ${options.siteDomain}
- Site Country: ${options.siteCountry}
- Site Industry: ${options.siteIndustry}`;

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

    // Add limit context to instructions
    if (
      options.recommendationLimit !== undefined &&
      options.recommendationLimit !== Number.POSITIVE_INFINITY &&
      options.activeRecommendationCount !== undefined
    ) {
      const remaining =
        options.recommendationLimit - options.activeRecommendationCount;
      instructions += `\n\nRecommendation limit: You can create ${Math.max(0, remaining)} more recommendations (${options.activeRecommendationCount}/${options.recommendationLimit} used). Complete or dismiss existing ones to free up slots.`;
    }

    if (options.pageSpeedRemaining !== undefined) {
      instructions += `\n\nPageSpeed budget: ${Math.max(0, options.pageSpeedRemaining)} tests remaining this month.`;
    }

    // Gate tools based on limits
    let tools = { ...allTools };
    if (
      options.pageSpeedRemaining !== undefined &&
      options.pageSpeedRemaining <= 0
    ) {
      const { runPageSpeed: _, ...rest } = tools;
      tools = rest as typeof tools;
    }

    return {
      ...settings,
      instructions,
      tools,
      model: options.model ?? settings.model,
    };
  },
});
