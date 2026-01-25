"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileTrigger() {
  return (
    <div className="mb-4 flex items-center gap-2">
      <SidebarTrigger />
      <span className="text-sm font-medium">Chats</span>
    </div>
  );
}
