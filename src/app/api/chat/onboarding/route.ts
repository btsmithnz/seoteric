import { streamText, convertToModelMessages, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "anthropic/claude-haiku-4.5",
    system:
      "You are Seoteric, an AI assistant specializing in SEO (Search Engine Optimization). You help users understand and improve their website's search engine visibility. You provide clear, actionable advice on topics like keyword research, on-page optimization, technical SEO, content strategy, and link building. Keep responses concise and practical.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
