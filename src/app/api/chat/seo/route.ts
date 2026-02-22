import { convertToModelMessages, generateId } from "ai";
import { NextResponse } from "next/server";
import z from "zod";
import { createSeoAgent } from "@/ai/seo";
import { createRunPageSpeedTool } from "@/ai/tools/pagespeed";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { parseLimitExceededError } from "@/lib/billing-errors";

const seoChatBodyExtras = z.object({
  siteId: z.string<Id<"sites">>(),
});

const seoChatBody = seoChatBodyExtras.extend({
  id: z.string(),
  messages: z.any().array(),
});

export type SeoChatBodyExtras = z.infer<typeof seoChatBodyExtras>;
export type SeoChatBody = z.infer<typeof seoChatBody>;

function getModelForPlan(plan: "starter" | "pro" | "agency") {
  return plan === "starter"
    ? "anthropic/claude-haiku-4.5"
    : "anthropic/claude-sonnet-4.5";
}

export async function POST(req: Request) {
  const body = await req.json();
  const { id: slug, siteId, messages } = seoChatBody.parse(body);

  let plan: "starter" | "pro" | "agency" = "starter";
  try {
    const messageUsage = await fetchAuthMutation(
      api.billing.consumeChatMessage
    );
    plan = messageUsage.plan;
  } catch (error) {
    const limitError = parseLimitExceededError(error);
    if (limitError) {
      return NextResponse.json(limitError, {
        status: 402,
      });
    }
    throw error;
  }

  const { chatId, site, recommendations } = await fetchAuthMutation(
    api.chat.generateChatContext,
    { siteId, slug, initialMessage: messages[0]?.parts[0]?.text }
  );

  const pageSpeedTool = createRunPageSpeedTool({
    beforeRun: async () => {
      const entitlements = await fetchAuthQuery(api.billing.getEntitlements);
      if (entitlements.remaining.pageSpeedReports <= 0) {
        throw new Error(
          `You've reached your ${entitlements.limits.pageSpeedReports} PageSpeed reports on the ${entitlements.plan} plan. Upgrade to continue.`
        );
      }
    },
    onSuccess: async () => {
      try {
        await fetchAuthMutation(api.billing.consumePageSpeedReport);
      } catch (error) {
        const limitError = parseLimitExceededError(error);
        if (limitError) {
          throw new Error(limitError.message);
        }
        throw error;
      }
    },
  });

  const seoAgent = createSeoAgent({
    model: getModelForPlan(plan),
    runPageSpeedTool: pageSpeedTool,
  });

  const res = await seoAgent.stream({
    messages: await convertToModelMessages(messages),
    options: {
      siteDomain: site.domain,
      siteName: site.name,
      siteCountry: site.country,
      siteIndustry: site.industry,
      existingRecommendations: recommendations.map((r) => ({
        _id: r._id,
        title: r.title,
        description: r.description,
        category: r.category,
        priority: r.priority,
        status: r.status,
        pageUrl: r.pageUrl,
      })),
    },
  });

  return res.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: () => generateId(),
    onFinish: async ({ messages }) => {
      await fetchAuthMutation(api.chat.updateChatState, { chatId, messages });
    },
  });
}
