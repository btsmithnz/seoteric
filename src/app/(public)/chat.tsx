"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ChevronUp, MessageCircle, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

const transport = new DefaultChatTransport({
  api: "/api/chat/onboarding",
});

const initialMessages: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: `Hey, hope you're doing well! 👋

I'm **Seoteric**, an AI assistant that specializes in SEO (Search Engine Optimization). Lets get you set up with an account so we can start optimizing your website's search engine presence.

To get started, tell me your name, email, and website domain.`,
      },
    ],
  },
];

export function ChatOnboardingSkeleton() {
  return (
    <div className="fixed inset-x-2 bottom-4 z-40 flex h-112 flex-col overflow-hidden rounded-xl border bg-background shadow-lg md:inset-x-auto md:left-1/2 md:w-xl md:-translate-x-1/2">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="font-medium text-sm">Seoteric</span>
      </div>
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState
            description="Ask me anything about SEO optimization"
            title="Welcome to Seoteric"
          />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function ChatOnboarding() {
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onboardingTool = useCallback(
    (input: Record<string, unknown>) => {
      startTransition(() => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(input)) {
          if (value !== undefined && value !== null) {
            params.set(key, String(value));
          }
        }
        router.push(`/onboarding?${params}`);
      });
    },
    [router]
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    messages: initialMessages,
    onToolCall: ({ toolCall }) => {
      switch (toolCall.toolName) {
        case "createAccount":
          onboardingTool(toolCall.input as Record<string, unknown>);
          return;
        default:
          break;
      }
    },
  });

  const handleSend = (text: string) => {
    sendMessage({ text });
    setInput("");
  };

  if (minimized) {
    return (
      <button
        className="fixed inset-x-2 bottom-4 z-40 flex cursor-pointer items-center gap-3 rounded-full border bg-background px-4 py-3 shadow-lg transition-all duration-200 md:inset-x-auto md:left-1/2 md:w-sm md:-translate-x-1/2"
        onClick={() => setMinimized(false)}
        type="button"
      >
        <MessageCircle className="size-5 text-muted-foreground" />
        <span className="flex-1 text-left text-muted-foreground text-sm">
          Tell me about your website...
        </span>
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-2 bottom-4 z-40 flex h-112 flex-col overflow-hidden rounded-xl border bg-background shadow-lg transition-all duration-200 md:inset-x-auto md:left-1/2 md:w-xl md:-translate-x-1/2">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="font-medium text-sm">Seoteric</span>
        <button
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          onClick={() => setMinimized(true)}
          type="button"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

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
          placeholder="Tell me about your website..."
          value={input}
        />
        <PromptInputFooter>
          <div />
          <PromptInputSubmit
            onStop={stop}
            status={isPending ? "streaming" : status}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
