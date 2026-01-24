"use client";

import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/src/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/src/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/src/components/ai-elements/prompt-input";
import { useState } from "react";

export function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop } = useChat();

  return (
    <div className="flex h-[600px] w-full max-w-2xl flex-col border">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Welcome to Seoteric"
              description="Ask me anything about SEO optimization"
            />
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.role === "user" ? (
                    message.parts
                      .filter((p) => p.type === "text")
                      .map((p, i) => <span key={i}>{p.text}</span>)
                  ) : (
                    <MessageResponse>
                      {message.parts
                        .filter((p) => p.type === "text")
                        .map((p) => p.text)
                        .join("")}
                    </MessageResponse>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={({ text }) => sendMessage({ text })}>
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
  );
}
