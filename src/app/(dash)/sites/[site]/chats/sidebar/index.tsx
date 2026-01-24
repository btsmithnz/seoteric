"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ChatList } from "./list";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageSquareIcon } from "lucide-react";
import Link from "next/link";

export function ChatSidebar({ siteId }: { siteId: Id<"sites"> }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-background">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquareIcon className="size-4" />
          Chats
        </div>
        <Button
          render={<Link href={`/sites/${siteId}/chats`} />}
          nativeButton={false}
          variant="ghost"
          size="icon-xs"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
      <ChatList siteId={siteId} />
    </aside>
  );
}
