"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sidebar,
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
  useSidebar,
} from "@/components/elements/sidebar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthQuery } from "@/lib/hooks";
import { ChatsList } from "./list";

export function ChatsSidebar() {
  const { site: siteId } = useParams<{ site: Id<"sites"> }>();
  const entitlements = useAuthQuery(api.billing.getEntitlements);
  const isLimitReached =
    entitlements !== undefined && entitlements.remaining.messages <= 0;
  const disableNewChat = isLimitReached;

  const sidebar = useSidebar();
  const { setMobileOpen } = sidebar.pick("chats");

  return (
    <Sidebar selector="chats" side="left">
      <div className="flex flex-row gap-2 p-2">
        <SidebarMobileToggleButton selector="chats" variant="outline">
          <SidebarMobileToggleIcon selector="chats" />
        </SidebarMobileToggleButton>

        {disableNewChat ? (
          <Button
            className="flex-1"
            disabled
            title="Message limit reached. Upgrade your plan in Account > Billing."
            variant="secondary"
          >
            New Chat
            <PlusIcon className="size-4" />
          </Button>
        ) : (
          <Button
            className="flex-1"
            nativeButton={false}
            onClick={() => setMobileOpen(false)}
            render={<Link href={`/sites/${siteId}/chats`} />}
            variant="secondary"
          >
            New Chat
            <PlusIcon className="size-4" />
          </Button>
        )}
      </div>

      <ChatsList siteId={siteId} />
    </Sidebar>
  );
}
