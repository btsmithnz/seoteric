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
import { RecommendationsPanel } from "@/components/recommendations/panel";

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
    <div className="flex h-full gap-4">
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="font-bold mb-1">{chat.name}</h1>
        <div className="flex flex-1 flex-col border">
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
      <div className="w-80 flex-shrink-0 border-l pl-4 overflow-y-auto hidden lg:block">
        <RecommendationsPanel siteId={props.siteId} />
      </div>
    </div>
  );
}
