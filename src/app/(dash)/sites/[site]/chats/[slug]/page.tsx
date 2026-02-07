import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { InitialiseChatSeo } from "../chat/provider";

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
