"use client";

import { Button } from "@/components/ui/button";
import { SidebarOpenIcon } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar";

export function ChatSidebarMobileTrigger() {
  const { setMobileOpen } = useSidebar();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        className="px-0"
        onClick={() => setMobileOpen(true)}
      >
        <SidebarOpenIcon className="mr-1" />
        Chats
      </Button>
    </div>
  );
}
