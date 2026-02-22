import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { CHAT_SUGGESTIONS } from "@/lib/suggestions";

interface ChatEmptyStateProps {
  disabled?: boolean;
  onSend: (msg: string) => void;
}

export function ChatEmptyState({
  disabled = false,
  onSend,
}: ChatEmptyStateProps) {
  return (
    <>
      <ConversationEmptyState
        description="Ask me anything about SEO optimization"
        title="Welcome to Seoteric"
      />
      <Suggestions className="mt-4 justify-center">
        {CHAT_SUGGESTIONS.map((suggestion) => (
          <Suggestion
            disabled={disabled}
            key={suggestion}
            onClick={onSend}
            suggestion={suggestion}
          />
        ))}
      </Suggestions>
    </>
  );
}
