import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { preloadAuthQuery } from "@/lib/auth-server";
import { ChatSeo } from "./chat";

export default async function SiteChatPage(
  props: PageProps<"/sites/[site]/chats/[chat]">
) {
  const params = await props.params;
  const siteId = params.site as Id<"sites">;
  const chatId = params.chat as Id<"chats">;

  const preloadedChat = await preloadAuthQuery(api.chat.getWithMessages, {
    chatId,
  });

  return <ChatSeo preloadedChat={preloadedChat} siteId={siteId} />;
}
