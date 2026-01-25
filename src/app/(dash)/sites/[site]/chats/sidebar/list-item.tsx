"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

type ChatListItemProps = {
  chat: Doc<"chats">;
  siteId: Id<"sites">;
};

export function ChatListItem({ chat, siteId }: ChatListItemProps) {
  const params = useParams<{ chat?: string }>();
  const isActive = params.chat === chat._id;
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuButton
      render={
        <Link
          href={`/sites/${siteId}/chats/${chat._id}`}
          onClick={() => setOpenMobile(false)}
        />
      }
      isActive={isActive}
    >
      <span className="truncate">{chat.name || "Untitled"}</span>
    </SidebarMenuButton>
  );
}
