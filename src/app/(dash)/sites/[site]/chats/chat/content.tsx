"use client";

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
import { ChatEmptyState } from "./empty";
import { useChatSeo } from "./provider";

export function ChatContent({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState("");
  const { messages, status, stop, sendMessage } = useChatSeo();

  const handleSend = (text: string) => {
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col">
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
