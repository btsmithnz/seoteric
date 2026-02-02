import type { Id } from "@/convex/_generated/dataModel";
import { ChatSeoCreate } from "./chat";

export default async function SitePage(
  props: PageProps<"/sites/[site]/chats">
) {
  const { site } = await props.params;

  return <ChatSeoCreate siteId={site as Id<"sites">} />;
}
