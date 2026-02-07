"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
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

To get started, I'll need to gather some information from you:

1. **Your Name** - What's your name?
2. **Your Email** - What's your email?
3. **Website Domain** - What's your website's domain (e.g., www.example.com)?

Once I have these details, we can create your account and get you on your way! What would you like to share first?`,
      },
    ],
  },
];

function ChatOnboardingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[480px] w-full max-w-2xl flex-col border">
      {children}
    </div>
  );
}

export function ChatOnboardingSkeleton() {
  return (
    <ChatOnboardingFrame>
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
    </ChatOnboardingFrame>
  );
}

export function ChatOnboarding() {
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onboardingTool = useCallback(
    (input: Record<string, string>) => {
      startTransition(() => {
        const params = new URLSearchParams(input);
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
          onboardingTool(toolCall.input as Record<string, string>);
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

  return (
    <ChatOnboardingFrame>
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
    </ChatOnboardingFrame>
  );
}
