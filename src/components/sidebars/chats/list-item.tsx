"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSidebar } from "@/components/elements/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Doc, Id } from "@/convex/_generated/dataModel";

interface ChatListItemProps {
  chat: Doc<"chats">;
  siteId: Id<"sites">;
}

export function ChatsListItemSkeleton() {
  return (
    <Button className="w-full justify-start" variant="ghost">
      <Skeleton className="h-4 w-full" />
    </Button>
  );
}

export function ChatsListItem({ chat, siteId }: ChatListItemProps) {
  const params = useParams<{ chat?: string }>();
  const sidebar = useSidebar();
  const { setMobileOpen } = sidebar.pick("chats");
  const isActive = params.chat === chat._id;

  return (
    <Button
      className="w-full justify-start"
      nativeButton={false}
      render={
        <Link
          href={`/sites/${siteId}/chats/${chat._id}`}
          onClick={() => setMobileOpen(false)}
        />
      }
      variant={isActive ? "default" : "ghost"}
    >
      <span className="truncate">{chat.name || "Untitled"}</span>
    </Button>
  );
}
