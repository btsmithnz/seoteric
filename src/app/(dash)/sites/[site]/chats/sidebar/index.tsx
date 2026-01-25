"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ChatList } from "./list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar";

export function ChatSidebar({ siteId }: { siteId: Id<"sites"> }) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Button
          render={<Link href={`/sites/${siteId}/chats`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          New Chat
          <PlusIcon className="size-4" />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <ChatList siteId={siteId} />
      </SidebarContent>
    </Sidebar>
  );
}
