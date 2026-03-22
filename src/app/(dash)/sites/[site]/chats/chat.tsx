"use client";

import { Suspense } from "react";
import { ChatContent } from "@/components/chat/content";
import { ChatProvider } from "@/components/chat/provider";
import type { Id } from "@/convex/_generated/dataModel";

export function ChatSeo({
  children,
  siteId,
}: {
  children: React.ReactNode;
  siteId: Id<"sites">;
}) {
  return (
    <ChatProvider siteId={siteId}>
      <Suspense>
        <ChatContent>{children}</ChatContent>
      </Suspense>
    </ChatProvider>
  );
}
