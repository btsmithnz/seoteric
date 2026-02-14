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
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { api } from "@/convex/_generated/api";
import { useAuthQuery } from "@/lib/hooks";
import { ChatEmptyState } from "./empty";
import { useChatSeo } from "./provider";

export function ChatContent({ children }: { children: React.ReactNode }) {
  const [input, setInput] = useState("");
  const { slug } = useParams<{ slug?: string }>();
  const { messages, status, stop, sendMessage, error } = useChatSeo();

  const chat = useAuthQuery(api.chat.getSafe, slug ? { slug } : "skip");
  const usage = useAuthQuery(api.usage.getUserUsage);

  const atMessageLimit =
    usage && usage.current.messages >= usage.limits.messagesPerMonth;

  const handleSend = (text: string) => {
    sendMessage({ text });
    setInput("");
  };

  // Extract error message from 429 responses
  const errorMessage =
    error && "message" in error ? (error as Error).message : undefined;

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
              {errorMessage && (
                <div className="mx-4 mb-2 border border-destructive/20 bg-destructive/5 p-3 text-destructive text-sm">
                  {errorMessage}
                </div>
              )}
              {children}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {atMessageLimit ? (
            <UpgradePrompt message="You've reached your monthly message limit." />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
