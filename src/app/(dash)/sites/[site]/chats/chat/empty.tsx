import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

interface ChatEmptyStateProps {
  onSend: (msg: string) => void;
}

export function ChatEmptyState({ onSend }: ChatEmptyStateProps) {
  return (
    <>
      <ConversationEmptyState
        description="Ask me anything about SEO optimization"
        title="Welcome to Seoteric"
      />
      <Suggestions className="mt-4 justify-center">
        <Suggestion onClick={onSend} suggestion="Audit my site" />
        <Suggestion onClick={onSend} suggestion="Check page speed" />
        <Suggestion onClick={onSend} suggestion="Review meta tags" />
        <Suggestion onClick={onSend} suggestion="Suggest keywords" />
        <Suggestion onClick={onSend} suggestion="Find SEO issues" />
      </Suggestions>
    </>
  );
}
