import { tool } from "ai";
import { z } from "zod";

export const updateMemoryTool = tool({
  description:
    "Update the site memory with useful context from conversations. Store things like the user's CMS, target audience, competitors, business goals, and preferences. Pass the full updated memory content (not a diff). Keep it concise — under 100 lines, one fact per line.",
  inputSchema: z.object({
    memory: z
      .string()
      .describe(
        "The full updated memory content. Each line should be a concise fact about the site, business, or user preferences."
      ),
  }),
  execute: (input) => {
    return { action: "updateMemory" as const, memory: input.memory };
  },
});

export interface UpdateMemoryOutput {
  action: "updateMemory";
  memory: string;
}
