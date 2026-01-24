import { seoAgent } from "@/ai/seo";
import { createAgentUIStreamResponse, UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  return createAgentUIStreamResponse({
    agent: seoAgent,
    uiMessages: messages,
  });
}
