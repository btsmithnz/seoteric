"use client";

import { UIMessage } from "@ai-sdk/react";
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
import { useState, useTransition } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export function ChatSeoCreate(props: {
  siteId: Id<"sites">;
  chatId?: Id<"chats">;
  initialMessages?: UIMessage[];
}) {
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const createMutation = useMutation(api.chat.create);

  const handleSend = async (msg: string) => {
    startTransition(async () => {
      const chatId = await createMutation({
        siteId: props.siteId,
        name: 'New chat',
        message: msg,
      });
      router.push(`/sites/${props.siteId}/chats/${chatId}`);
    });
  };

  return (
    <div className="flex h-[600px] w-full max-w-2xl flex-col border">
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState
            title="Welcome to Seoteric"
            description="Ask me anything about SEO optimization"
          />
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
          <PromptInputSubmit status={isPending ? "streaming" : undefined} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
