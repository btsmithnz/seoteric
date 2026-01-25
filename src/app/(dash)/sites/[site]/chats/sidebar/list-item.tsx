"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/providers/sidebar";

type ChatListItemProps = {
  chat: Doc<"chats">;
  siteId: Id<"sites">;
};

export function ChatListItem({ chat, siteId }: ChatListItemProps) {
  const params = useParams<{ chat?: string }>();
  const { setMobileOpen } = useSidebar();
  const isActive = params.chat === chat._id;

  return (
    <Button
      className="w-full justify-start"
      render={
        <Link
          href={`/sites/${siteId}/chats/${chat._id}`}
          onClick={() => setMobileOpen(false)}
        />
      }
      variant={isActive ? "default" : "ghost"}
      nativeButton={false}
    >
      <span className="truncate">{chat.name || "Untitled"}</span>
    </Button>
  );
}
