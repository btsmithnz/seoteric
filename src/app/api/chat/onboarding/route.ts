import { convertToModelMessages, type UIMessage } from "ai";
import { onboardingAgent } from "@/ai/onboarding";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const res = await onboardingAgent.stream({
    messages: await convertToModelMessages(messages),
  });

  return res.toUIMessageStreamResponse();
}
