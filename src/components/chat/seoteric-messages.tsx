import { UIMessage } from "ai";
import { Message, MessageResponse } from "../ai-elements/message";
import { MessageContent } from "../ai-elements/message";
import { BrainIcon } from "lucide-react";
import { CreateRecommendationOutput } from "@/ai/tools/recommendations";
import { SpeedTestOutput } from "@/ai/tools/speed-test";
import {
  CreateAccountTool,
  WebsiteNameTool,
  WebsiteTextTool,
  InspectDomTool,
  CreateRecommendationTool,
  UpdateRecommendationTool,
  SpeedTestTool,
} from "./tools";

function SeotericMessage({ id, message }: { id: string; message: UIMessage }) {
  return (
    <div>
      {message.parts.map((part, idx) => {
        const partId = `${id}-${idx}`;

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
            return <CreateAccountTool key={partId} />;

          case "tool-getWebsiteName":
            return <WebsiteNameTool key={partId} />;

          case "tool-getWebsiteText":
            return <WebsiteTextTool key={partId} />;

          case "tool-inspectDom":
            return <InspectDomTool key={partId} />;

          case "tool-createRecommendation":
            return (
              <CreateRecommendationTool
                key={partId}
                state={part.state}
                output={part.output as CreateRecommendationOutput}
              />
            );

          case "tool-updateRecommendation":
            return <UpdateRecommendationTool key={partId} state={part.state} />;

          case "tool-runSpeedTest":
            return (
              <SpeedTestTool
                key={partId}
                state={part.state}
                output={part.output as SpeedTestOutput}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export function SeotericMessages({ messages }: { messages: UIMessage[] }) {
  console.log(messages);
  return (
    <>
      {messages.map((message, messageIdx) => {
        const messageId = message.id || `message-${messageIdx}`;
        return (
          <SeotericMessage key={messageId} id={messageId} message={message} />
        );
      })}
    </>
  );
}
