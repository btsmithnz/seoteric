"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const { messages, status, stop, sendMessage } = useChatSeo();
  const entitlements = useAuthQuery(api.billing.getEntitlements);
  const disableInput =
    entitlements !== undefined && entitlements.remaining.messages <= 0;
  const searchParams = useSearchParams();
  const initialQueryRef = useRef(searchParams.get("q"));

  const handleSend = (text: string) => {
    if (disableInput) {
      return;
    }
    sendMessage({ text });
    setInput("");
  };

  useEffect(() => {
    const q = initialQueryRef.current;
    if (!q || disableInput) {
      return;
    }
    initialQueryRef.current = null;
    sendMessage({ text: q });
  }, [disableInput, sendMessage]);

  return (
    <div className="flex h-full gap-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <Conversation>
            <ConversationContent>
              {messages.length === 0 ? (
                <ChatEmptyState disabled={disableInput} onSend={handleSend} />
              ) : (
                <SeotericMessages messages={messages} status={status} />
              )}
              {children}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PromptInput onSubmit={(msg) => handleSend(msg.text)}>
            <PromptInputTextarea
              disabled={disableInput}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about SEO..."
              value={input}
            />
            <PromptInputFooter>
              <div />
              <PromptInputSubmit
                disabled={disableInput}
                onStop={stop}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
