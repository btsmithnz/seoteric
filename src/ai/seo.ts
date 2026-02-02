import { ToolLoopAgent } from "ai";
import {
  getWebsiteNameTool,
  getWebsiteTextTool,
  inspectDomTool,
} from "./tools/website";
import { fetchRobotsTxtTool } from "./tools/robots";
import { fetchSitemapTool } from "./tools/sitemap";
import { checkUrlStatusTool } from "./tools/link-checker";
import { getPageSeoDataTool } from "./tools/seo-analysis";
import {
  createRecommendationTool,
  updateRecommendationTool,
} from "./tools/recommendations";
import { runSpeedTestTool } from "./tools/speed-test";
import { runPageSpeedTool } from "./tools/pagespeed";
import { z } from "zod";

const existingRecommendationSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  pageUrl: z.string().optional(),
});

export const seoAgent = new ToolLoopAgent({
  model: "anthropic/claude-haiku-4.5",
  instructions: `You are Seoteric, an AI assistant specializing in SEO (Search Engine Optimization). You help users understand and improve their website's search engine visibility. You provide clear, actionable advice on topics like keyword research, on-page optimization, technical SEO, content strategy, and link building. Keep responses concise and practical. Summarise tool call results instead of returning all the data - we visualise the data in the UI.`,
  tools: {
    getWebsiteName: getWebsiteNameTool,
    getWebsiteText: getWebsiteTextTool,
    inspectDom: inspectDomTool,
    fetchRobotsTxt: fetchRobotsTxtTool,
    fetchSitemap: fetchSitemapTool,
    checkUrlStatus: checkUrlStatusTool,
    getPageSeoData: getPageSeoDataTool,
    createRecommendation: createRecommendationTool,
    updateRecommendation: updateRecommendationTool,
    runSpeedTest: runSpeedTestTool,
    runPageSpeed: runPageSpeedTool,
  },
  callOptionsSchema: z.object({
    siteDomain: z.string(),
    siteName: z.string(),
    siteCountry: z.string(),
    siteIndustry: z.string(),
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
