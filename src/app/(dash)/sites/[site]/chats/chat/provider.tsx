"use client";

import { type UseChatHelpers, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId, type UIMessage } from "ai";
import { useParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import {
  getLimitToastMessage,
  parseLimitExceededError,
} from "@/lib/billing-errors";

function useTransport({ siteId }: { siteId: Id<"sites"> }) {
  return useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/chat/seo",
      body: {
        siteId,
      },
    });
  }, [siteId]);
}

const ChatContext = createContext<UseChatHelpers<UIMessage> | null>(null);

export function ChatProvider({
  children,
  siteId,
}: {
  children: React.ReactNode;
  siteId: Id<"sites">;
}) {
  const { slug } = useParams<{ slug?: string }>();
  const transport = useTransport({ siteId });
  const router = useRouter();

  // Generate a stable slug/id for the chat
  const stableSlug = useMemo(() => {
    return slug ?? generateId();
  }, [slug]);

  const chat = useChat({
    id: stableSlug,
    transport,
  });
  const lastError = useRef<string | null>(null);

  // Update the URL once the chat is created
  useEffect(() => {
    if (!slug && chat.status === "streaming") {
      router.push(`/sites/${siteId}/chats/${stableSlug}`);
    }
  }, [chat.status, router, siteId, slug, stableSlug]);

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

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useChatSeo() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatContext");
  }
  return context;
}

/**
 * Initialise the chat with the given data
 * @param data - The messages to initialise the chat with
 */
export function InitialiseChatSeo({ data }: { data: UIMessage[] }) {
  const { messages, setMessages } = useChatSeo();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages(data);
    }
  }, [data, messages, setMessages]);

  return null;
}
