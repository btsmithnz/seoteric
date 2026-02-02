"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { SeotericMessages } from "@/components/chat/seoteric-messages";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const transport = new DefaultChatTransport({
  api: "/api/chat/seo",
});

export function ChatSeo(props: {
  siteId: Id<"sites">;
  preloadedChat: Preloaded<typeof api.chat.getWithMessages>;
}) {
  const [input, setInput] = useState("");

  const chat = usePreloadedQuery(props.preloadedChat);

  const { messages, sendMessage, status, stop } = useChat({
    id: chat._id,
    transport,
    messages: chat.messages,
  });

  const isEmpty = messages.length === 0;

  const sentInitialMessage = useRef(false);
  useEffect(() => {
    if (chat.initialMessage && isEmpty && !sentInitialMessage.current) {
      sentInitialMessage.current = true;
      sendMessage({ text: chat.initialMessage });
    }
  }, [chat.initialMessage, isEmpty, sendMessage]);

  const handleSend = (msg: string) => {
    sendMessage({ text: msg });
    setInput("");
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="mb-1 font-bold">{chat.name}</h1>
        <div className="flex flex-1 flex-col border">
          <Conversation>
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  description="Ask me anything about SEO optimization"
                  title="Welcome to Seoteric"
                />
              ) : (
                <SeotericMessages messages={messages} status={status} />
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PromptInput onSubmit={(msg) => handleSend(msg.text)}>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about SEO..."
              value={input}
            />
            <PromptInputFooter>
              <div />
              <PromptInputSubmit onStop={stop} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
