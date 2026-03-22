"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ChatContent } from "@/components/chat/content";
import { ChatContext } from "@/components/chat/provider";
import type { Id } from "@/convex/_generated/dataModel";
import {
  getLimitToastMessage,
  parseLimitExceededError,
} from "@/lib/billing-errors";

interface AgentChatProps {
  initialMessages: unknown[];
  initialSlug: string;
  siteId: Id<"sites">;
}

export function AgentChat({
  initialMessages,
  initialSlug,
  siteId,
}: AgentChatProps) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat/seo",
        body: { siteId },
      }),
    [siteId]
  );

  const chat = useChat({ id: initialSlug, transport });
  const lastError = useRef<string | null>(null);

  // Hydrate initial messages
  useEffect(() => {
    if (initialMessages.length > 0 && chat.messages.length === 0) {
      chat.setMessages(initialMessages as UIMessage[]);
    }
  }, [initialMessages, chat.messages.length, chat.setMessages]);

  // Error handling
  useEffect(() => {
    if (!chat.error) {
      lastError.current = null;
      return;
    }

    if (lastError.current === chat.error.message) {
      return;
    }
    lastError.current = chat.error.message;

    const limitError = parseLimitExceededError(chat.error);
    if (limitError) {
      toast.error(getLimitToastMessage(limitError), {
        description: "Open Account to upgrade or manage billing.",
      });
      return;
    }

    toast.error("Unable to send message. Please try again.");
  }, [chat.error]);

  return (
    <ChatContext.Provider value={chat}>
      <Suspense>
        <ChatContent>{null}</ChatContent>
      </Suspense>
    </ChatContext.Provider>
  );
}
