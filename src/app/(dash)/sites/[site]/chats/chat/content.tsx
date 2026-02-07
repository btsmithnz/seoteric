"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { SeotericMessages } from "@/components/chat/seoteric-messages";
import { api } from "@/convex/_generated/api";
import { useAuthQuery } from "@/lib/hooks";
import { ChatEmptyState } from "./empty";
import { useChatSeo } from "./provider";

export function ChatContent({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState("");
  const { slug } = useParams<{ slug?: string }>();
  const { messages, status, stop, sendMessage } = useChatSeo();

  const chat = useAuthQuery(api.chat.getSafe, slug ? { slug } : "skip");

  const handleSend = (text: string) => {
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="mb-1 font-bold">{chat?.name || "New Chat"}</h1>
        <div className="flex flex-1 flex-col border">
          <Conversation>
            <ConversationContent>
              {messages.length === 0 ? (
                <ChatEmptyState onSend={handleSend} />
              ) : (
                <SeotericMessages messages={messages} status={status} />
              )}
              {children}
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
