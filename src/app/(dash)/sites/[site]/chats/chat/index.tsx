"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { ChatContent } from "./content";
import { ChatProvider } from "./provider";

export function ChatSeo({
  children,
  siteId,
}: {
  children: React.ReactNode;
  siteId: Id<"sites">;
}) {
  return (
    <ChatProvider siteId={siteId}>
      <ChatContent>{children}</ChatContent>
    </ChatProvider>
  );
}
