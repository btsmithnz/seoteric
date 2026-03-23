import { tool } from "ai";
import { z } from "zod";

export const updateMemoryTool = tool({
  description:
    "Save or update a memory about this site. Use this to persist useful context from conversations. Each call overwrites the previous value.",
  inputSchema: z.object({
    value: z
      .string()
      .describe(
        "The memory content. Should be concise and factual — one topic per memory."
      ),
  }),
  execute: (input) => {
    return {
      action: "updateMemory" as const,
      key: "general",
      value: input.value,
    };
  },
});

export interface UpdateMemoryOutput {
  action: "updateMemory";
  key: string;
  value: string;
}

interface RecallMemoriesCallbacks {
  search: (query: string) => Promise<{ key: string; value: string }[]>;
}

export function createRecallMemoriesTool(callbacks: RecallMemoriesCallbacks) {
  return tool({
    description:
      "Search site memories for relevant context from previous conversations. Use this when you need background about the site, business, competitors, audience, goals, or user preferences.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "A natural language query describing what context you need, e.g. 'target audience and business goals' or 'competitor analysis'."
        ),
    }),
    execute: ({ query }) => {
      return callbacks.search(query);
    },
  });
}
