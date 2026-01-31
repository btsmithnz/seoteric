"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ChatsList } from "./list";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
  useSidebar,
} from "@/components/elements/sidebar";

export function ChatsSidebar({ siteId }: { siteId: Id<"sites"> }) {
  const sidebar = useSidebar();
  const { setMobileOpen } = sidebar.pick("chats");

  return (
    <Sidebar side="left" selector="chats">
      <div className="flex flex-row">
        <Button
          className="flex-1"
          render={<Link href={`/sites/${siteId}/chats`} />}
          nativeButton={false}
          variant="outline"
          onClick={() => setMobileOpen(false)}
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
