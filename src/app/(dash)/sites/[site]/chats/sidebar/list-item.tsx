"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id, Doc } from "@/convex/_generated/dataModel";

type ChatListItemProps = {
  chat: Doc<"chats">;
  siteId: Id<"sites">;
};

export function ChatListItem({ chat, siteId }: ChatListItemProps) {
  const params = useParams<{ chat?: string }>();
  const isActive = params.chat === chat._id;

  return (
    <Button
      render={<Link href={`/sites/${siteId}/chats/${chat._id}`} />}
      nativeButton={false}
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start truncate font-normal",
        isActive && "bg-muted"
      )}
    >
      {chat.name || "New chat"}
    </Button>
  );
}
