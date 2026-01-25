import { UIMessage } from "ai";
import { Message, MessageResponse } from "../ai-elements/message";
import { MessageContent } from "../ai-elements/message";
import { BrainIcon, GlobeIcon, SearchIcon } from "lucide-react";
import { Spinner } from "../ui/spinner";

function ToolCall({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-gray-500">
      {icon} {children}
    </p>
  );
}

export function SeotericMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <>
      {messages.map((message) => (
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
                  <ToolCall
                    key={partId}
                    icon={<Spinner className="size-4 inline" />}
                  >
                    Creating your account
                  </ToolCall>
                );

              case "tool-getWebsiteName":
                return (
                  <ToolCall
                    key={partId}
                    icon={<GlobeIcon className="size-4 inline" />}
                  >
                    Looking at your website
                  </ToolCall>
                );

              case "tool-getWebsiteText":
                return (
                  <ToolCall
                    key={partId}
                    icon={<GlobeIcon className="size-4 inline" />}
                  >
                    Reading your website
                  </ToolCall>
                );

              case "tool-inspectDom":
                return (
                  <ToolCall
                    key={partId}
                    icon={<SearchIcon className="size-4 inline" />}
                  >
                    Inspecting your website
                  </ToolCall>
                );

              default:
                return null;
            }
          })}
        </div>
      ))}
    </>
  );
}
