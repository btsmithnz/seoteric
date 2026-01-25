"use client";

import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { useEffect, useRef, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { DefaultChatTransport } from "ai";
import { convexSiteUrl } from "@/lib/env";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SeotericMessages } from "@/components/chat/seoteric-messages";

const transport = new DefaultChatTransport({
  api: `${convexSiteUrl}/chat/seo`,
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
    <div>
      <h1 className="font-bold">{chat.name}</h1>
      <div className="flex size-full flex-col border">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Welcome to Seoteric"
                description="Ask me anything about SEO optimization"
              />
            ) : (
              <SeotericMessages messages={messages} />
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={(msg) => handleSend(msg.text)}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SEO..."
          />
          <PromptInputFooter>
            <div />
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
