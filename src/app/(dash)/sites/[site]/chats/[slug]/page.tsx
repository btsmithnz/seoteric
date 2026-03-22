import { notFound } from "next/navigation";
import { InitialiseChatSeo } from "@/components/chat/provider";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";

export default async function SiteChatPage(
  props: PageProps<"/sites/[site]/chats/[slug]">
) {
  const { slug } = await props.params;

  const chat = await fetchAuthQuery(api.chat.getWithMessages, { slug });

  if (!chat) {
    notFound();
  }

  return <InitialiseChatSeo data={chat.messages} />;
}
