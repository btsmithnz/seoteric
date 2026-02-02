import { ChatStatus, UIMessage } from "ai";
import { Message, MessageResponse } from "../ai-elements/message";
import { MessageContent } from "../ai-elements/message";
import { CreateRecommendationOutput } from "@/ai/tools/recommendations";
import { SpeedTestOutput } from "@/ai/tools/speed-test";
import { PageSpeedOutput } from "@/ai/tools/pagespeed";
import {
  CreateAccountTool,
  WebsiteNameTool,
  WebsiteTextTool,
  InspectDomTool,
  CreateRecommendationTool,
  UpdateRecommendationTool,
  SpeedTestTool,
  PageSpeedTool,
} from "./tools";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "../ai-elements/reasoning";

function MessageRender({
  id,
  message,
  status,
  isLast,
}: {
  id: string;
  message: UIMessage;
  status: ChatStatus;
  isLast: boolean;
}) {
  return (
    <>
      {message.parts.map((part, idx) => {
        const partId = `${id}-${idx}`;
        const isLastPart = idx === message.parts.length - 1;

        switch (part.type) {
          case "text":
            return <MessageResponse key={partId}>{part.text}</MessageResponse>;

          case "reasoning":
            return (
              <Reasoning
                key={partId}
                className="w-full"
                isStreaming={status === "streaming" && isLast && isLastPart}
              >
                <ReasoningTrigger />
                <ReasoningContent>{part.text}</ReasoningContent>
              </Reasoning>
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

          case "tool-runPageSpeed":
            return (
              <PageSpeedTool
                key={partId}
                state={part.state}
                output={part.output as PageSpeedOutput}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}

export function SeotericMessages({
  messages,
  status,
}: {
  messages: UIMessage[];
  status: ChatStatus;
}) {
  return (
    <>
      {messages.map((message, messageIdx) => {
        const messageId = message.id || `message-${messageIdx}`;
        return (
          <Message from={message.role} key={messageId}>
            <MessageContent>
              <MessageRender
                id={messageId}
                message={message}
                status={status}
                isLast={messageIdx === messages.length - 1}
              />
            </MessageContent>
          </Message>
        );
      })}
    </>
  );
}
