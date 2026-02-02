"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
  useSidebar,
} from "@/components/elements/sidebar";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatsList } from "./list";

export function ChatsSidebar({ siteId }: { siteId: Id<"sites"> }) {
  const sidebar = useSidebar();
  const { setMobileOpen } = sidebar.pick("chats");

  return (
    <Sidebar selector="chats" side="left">
      <div className="flex flex-row">
        <Button
          className="flex-1"
          nativeButton={false}
          onClick={() => setMobileOpen(false)}
          render={<Link href={`/sites/${siteId}/chats`} />}
          variant="outline"
        >
          New Chat
          <PlusIcon className="size-4" />
        </Button>

        <SidebarMobileToggleButton selector="chats" variant="outline">
          <SidebarMobileToggleIcon selector="chats" />
        </SidebarMobileToggleButton>
      </div>

      <ChatsList siteId={siteId} />
    </Sidebar>
  );
}
