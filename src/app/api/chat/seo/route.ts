import { convertToModelMessages, generateId } from "ai";
import z from "zod";
import { seoAgent } from "@/ai/seo";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fetchAuthMutation } from "@/lib/auth-server";

const seoChatBodyExtras = z.object({
  siteId: z.string<Id<"sites">>(),
});

const seoChatBody = seoChatBodyExtras.extend({
  id: z.string(),
  messages: z.any().array(),
});

export type SeoChatBodyExtras = z.infer<typeof seoChatBodyExtras>;
export type SeoChatBody = z.infer<typeof seoChatBody>;

export async function POST(req: Request) {
  const body = await req.json();
  const { id: slug, siteId, messages } = seoChatBody.parse(body);

  const { chatId, site, recommendations } = await fetchAuthMutation(
    api.chat.generateChatContext,
    { siteId, slug, initialMessage: messages[0]?.parts[0]?.text }
  );

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
