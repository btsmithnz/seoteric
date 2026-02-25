import { tool } from "ai";
import { z } from "zod";

const categorySchema = z.enum([
  "technical",
  "content",
  "on-page",
  "off-page",
  "performance",
]);

const prioritySchema = z.enum(["critical", "high", "medium", "low"]);

const statusSchema = z.enum(["open", "in_progress", "completed", "dismissed"]);

export const createRecommendationTool = tool({
  description:
    "Create a new SEO recommendation for the site. Use this to track actionable improvements the user should make. Recommendations are displayed to the user so just summarise the response.",
  inputSchema: z.object({
    title: z
      .string()
      .describe("Short, actionable title for the recommendation"),
    description: z
      .string()
      .describe("Detailed explanation of the issue and how to fix it"),
    category: categorySchema.describe("The category of SEO issue"),
    priority: prioritySchema.describe(
      "Priority level: critical for severe issues, high for important, medium for moderate, low for minor"
    ),
    pageUrl: z
      .string()
      .optional()
      .describe("Specific page URL this recommendation applies to, if any"),
  }),
  execute: (input) => {
    return { action: "create" as const, ...input };
  },
});

export const updateRecommendationTool = tool({
  description:
    "Update an existing recommendation's status or priority. Use this when the user indicates they've fixed an issue or want to change its priority.",
  inputSchema: z.object({
    recommendationId: z
      .string()
      .describe("The ID of the recommendation to update"),
    status: statusSchema
      .optional()
      .describe("New status: completed when fixed, dismissed if not relevant"),
    priority: prioritySchema
      .optional()
      .describe("New priority level if changing"),
  }),
  execute: (input) => {
    return { action: "update" as const, ...input };
  },
});

export interface CreateRecommendationOutput {
  action: "create";
  category: "technical" | "content" | "on-page" | "off-page" | "performance";
  description: string;
  pageUrl?: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
}

export interface UpdateRecommendationOutput {
  action: "update";
  priority?: "critical" | "high" | "medium" | "low";
  recommendationId: string;
  status?: "open" | "in_progress" | "completed" | "dismissed";
}
