"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ChatList } from "./list";
import { Button } from "@/components/ui/button";
import { PlusIcon, SidebarCloseIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/sidebar";

export function ChatSidebar({ siteId }: { siteId: Id<"sites"> }) {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div
      className={cn(
        "absolute md:sticky top-0 md:block flex flex-col border-r border-border bg-background h-[calc(100vh-3rem)] md:h-auto w-full z-10 md:w-64",
        !mobileOpen && "hidden"
      )}
    >
      <div className="flex flex-row">
        <Button
        className="flex-1"
          render={<Link href={`/sites/${siteId}/chats`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(false)}
        >
          New Chat
          <PlusIcon className="size-4" />
        </Button>

        <Button
          className="md:hidden"
          variant="outline"
          size="icon-sm"
          onClick={() => setMobileOpen(false)}
        >
          <SidebarCloseIcon className="size-4" />
        </Button>
      </div>

      <ChatList siteId={siteId} />
    </div>
  );
}
