import { type LanguageModel, ToolLoopAgent } from "ai";
import { z } from "zod";
import { existingRecommendationSchema, siteContextSchema } from "../schemas";
import {
  createBusinessReviewSubagent,
  createBusinessReviewTool,
} from "../subagents/business-review";
import {
  createCompetitorAnalysisSubagent,
  createCompetitorAnalysisTool,
} from "../subagents/competitor-analysis";
import {
  createTechnicalAuditSubagent,
  createTechnicalAuditTool,
} from "../subagents/technical-audit";
import { analyzePageTool } from "../tools/analyze-page";
import { googleSerpTool } from "../tools/google-serp";
import {
  type createRecallMemoriesTool,
  updateMemoryTool,
} from "../tools/memory";
import type { createRunPageSpeedTool } from "../tools/pagespeed";
import {
  createRecommendationTool,
  updateRecommendationTool,
} from "../tools/recommendations";
import { scrapePageTool } from "../tools/scrape-page";

interface SeoAgentConfig {
  model: LanguageModel;
  recallMemoriesTool: ReturnType<typeof createRecallMemoriesTool>;
  runPageSpeedTool?: ReturnType<typeof createRunPageSpeedTool>;
  saveMemory: (key: string, value: string) => Promise<void>;
}

export function createSeoAgent({
  model,
  runPageSpeedTool,
  recallMemoriesTool,
  saveMemory,
}: SeoAgentConfig) {
  const businessReviewSubagent = createBusinessReviewSubagent({
    model,
    saveMemory,
  });
  const competitorAnalysisSubagent = createCompetitorAnalysisSubagent({
    model,
    saveMemory,
  });
  const technicalAuditSubagent = createTechnicalAuditSubagent({
    model,
    saveMemory,
    runPageSpeedTool,
  });

  return new ToolLoopAgent({
    model,
    instructions: `You are Seoteric, an AI assistant specializing in SEO (Search Engine Optimization). You help users understand and improve their website's search engine visibility. You provide clear, actionable advice and thorough audits.

## Rules:
- Never talk about plans, pricing, or billing
- Always be empathetic and professional
- If you don't know something, say so
- Keep responses concise and actionable
- Summarise tool call results instead of returning all the data (we visualise the data in the UI)
- Never call tools with site domains other the one specified below
- Use recallMemories to look up prior context about the site when it would be helpful (e.g. business goals, competitors, audience, preferences)
- Use updateMemory to save useful context from conversations. Don't store transient info like specific audit results.`,
    tools: {
      analyzePage: analyzePageTool,
      googleSerp: googleSerpTool,
      scrapePage: scrapePageTool,
      createRecommendation: createRecommendationTool,
      updateRecommendation: updateRecommendationTool,
      updateMemory: updateMemoryTool,
      recallMemories: recallMemoriesTool,
    },
    callOptionsSchema: siteContextSchema.extend({
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
  .join("\n")}

When the user mentions fixing something, use updateRecommendation to mark the relevant recommendation as completed.`;
      }

      return {
        ...settings,
        instructions,
        tools: {
          ...settings.tools,
          businessReview: createBusinessReviewTool(
            businessReviewSubagent,
            options
          ),
          competitorAnalysis: createCompetitorAnalysisTool(
            competitorAnalysisSubagent,
            options
          ),
          technicalAudit: createTechnicalAuditTool(
            technicalAuditSubagent,
            options
          ),
        } as typeof settings.tools,
      };
    },
  });
}
