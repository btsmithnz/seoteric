import type { ChatStatus, UIMessage } from "ai";
import type { PageSpeedOutput } from "@/ai/tools/pagespeed";
import type { CreateRecommendationOutput } from "@/ai/tools/recommendations";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "../ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "../ai-elements/reasoning";
import {
  AnalyzePageTool,
  CheckKeywordCannibalizationTool,
  CheckSecurityHeadersTool,
  CheckTrustSignalsTool,
  CheckUrlStatusTool,
  CreateAccountTool,
  CreateRecommendationTool,
  FetchRobotsTxtTool,
  FetchSitemapTool,
  GoogleSerpTool,
  InspectDomTool,
  PageSpeedTool,
  UpdateRecommendationTool,
  WebsiteNameTool,
  WebsiteTextTool,
} from "./tools";

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
                className="w-full"
                isStreaming={status === "streaming" && isLast && isLastPart}
                key={partId}
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
                output={part.output as CreateRecommendationOutput}
                state={part.state}
              />
            );

          case "tool-updateRecommendation":
            return <UpdateRecommendationTool key={partId} state={part.state} />;

          case "tool-runPageSpeed":
            return (
              <PageSpeedTool
                key={partId}
                output={part.output as PageSpeedOutput}
                state={part.state}
              />
            );

          case "tool-checkUrlStatus":
            return <CheckUrlStatusTool key={partId} state={part.state} />;

          case "tool-fetchRobotsTxt":
            return <FetchRobotsTxtTool key={partId} state={part.state} />;

          case "tool-fetchSitemap":
            return <FetchSitemapTool key={partId} state={part.state} />;

          case "tool-checkSecurityHeaders":
            return <CheckSecurityHeadersTool key={partId} state={part.state} />;

          case "tool-checkTrustSignals":
            return <CheckTrustSignalsTool key={partId} state={part.state} />;

          case "tool-analyzePage":
            return <AnalyzePageTool key={partId} state={part.state} />;

          case "tool-checkKeywordCannibalization":
            return (
              <CheckKeywordCannibalizationTool
                key={partId}
                state={part.state}
              />
            );

          case "tool-googleSerp":
            return <GoogleSerpTool key={partId} state={part.state} />;

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
                isLast={messageIdx === messages.length - 1}
                message={message}
                status={status}
              />
            </MessageContent>
          </Message>
        );
      })}
    </>
  );
}
