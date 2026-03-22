import { Loader2Icon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fetchAuthQuery } from "@/lib/auth-server";
import { AgentChat } from "./agent-chat";

export default async function AgentPage(
  props: PageProps<"/sites/[site]/agent">
) {
  const { site: siteId } = await props.params;
  const typedSiteId = siteId as Id<"sites">;

  const chatData = await fetchAuthQuery(api.chat.getLatestAgentChat, {
    siteId: typedSiteId,
  });

  if (!chatData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          <span>Loading agent...</span>
        </div>
      </div>
    );
  }

  return (
    <AgentChat
      initialMessages={chatData.messages}
      initialSlug={chatData.slug}
      siteId={typedSiteId}
    />
  );
}
