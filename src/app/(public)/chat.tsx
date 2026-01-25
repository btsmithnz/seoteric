"use client";

import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { useCallback, useState, useTransition } from "react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { BrainIcon, GlobeIcon, HammerIcon, UserIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const transport = new DefaultChatTransport({
  api: `/api/chat/onboarding`,
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
3. **Website Name** - What's the name of your website?
4. **Website Domain** - What's your website's domain (e.g., www.example.com)?
5. **Website Country** - What's the country where your business is primarily based?
6. **Website Industry** - What's the industry or sector the website serves?

Once I have these details, we can create your account and get you on your way! What would you like to share first?`,
      },
    ],
  },
];

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
              <div key={message.id}>
                {message.parts.map((part, idx) => {
                  const partId = `${message.id}-${idx}`;

                  switch (part.type) {
                    case "text":
                      return (
                        <Message key={partId} from={message.role}>
                          <MessageContent>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                        </Message>
                      );

                    case "reasoning":
                      return (
                        <p key={partId} className="text-sm text-gray-500">
                          <BrainIcon className="size-4 inline" />{" "}
                          {part.text || "Reasoning"}
                        </p>
                      );

                    case "tool-createAccount":
                      return (
                        <p key={partId} className="text-sm text-gray-500">
                          <Spinner className="size-4 inline" /> Creating your
                          account
                        </p>
                      );

                    case "tool-getWebsiteName":
                      return (
                        <p key={partId} className="text-sm text-gray-500">
                          <GlobeIcon className="size-4 inline" /> Looking at
                          your website
                        </p>
                      );

                    case "tool-getWebsiteText":
                      return (
                        <p key={partId} className="text-sm text-gray-500">
                          <GlobeIcon className="size-4 inline" /> Reading your
                          website
                        </p>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={(msg) => handleSend(msg.text)}>
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me about your website..."
        />
        <PromptInputFooter>
          <div />
          <PromptInputSubmit
            status={isPending ? "streaming" : status}
            onStop={stop}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
