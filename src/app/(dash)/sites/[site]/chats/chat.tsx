"use client";

import type { UIMessage } from "@ai-sdk/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function ChatSeoCreate(props: {
  siteId: Id<"sites">;
  chatId?: Id<"chats">;
  initialMessages?: UIMessage[];
}) {
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const createMutation = useMutation(api.chat.create);

  const handleSend = (msg: string) => {
    startTransition(async () => {
      const chatId = await createMutation({
        siteId: props.siteId,
        name: "New chat",
        message: msg,
      });
      router.push(`/sites/${props.siteId}/chats/${chatId}`);
    });
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex min-w-0 flex-1 flex-col border">
        <Conversation>
          <ConversationContent>
            <ConversationEmptyState
              description="Ask me anything about SEO optimization"
              title="Welcome to Seoteric"
            />
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
            <PromptInputSubmit status={isPending ? "streaming" : undefined} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
