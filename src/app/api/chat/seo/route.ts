import { seoAgent } from "@/ai/seo";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { convertToModelMessages, generateId, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { id: chatId, messages }: { id: Id<"chats">; messages: UIMessage[] } =
    await req.json();

  const { site, recommendations } = await fetchAuthQuery(
    api.chat.getChatContext,
    { chatId }
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
