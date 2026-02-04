import { convertToModelMessages, type UIMessage } from "ai";
import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";
import { onboardingAgent } from "@/ai/onboarding";

export async function POST(req: Request) {
  const verification = await checkBotId();

  if (verification.isBot) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const res = await onboardingAgent.stream({
    messages: await convertToModelMessages(messages),
  });

  return res.toUIMessageStreamResponse();
}
