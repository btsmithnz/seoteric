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
  type AnalyzePageToolInput,
  CheckKeywordCannibalizationTool,
  type CheckKeywordCannibalizationToolInput,
  CheckSecurityHeadersTool,
  type CheckSecurityHeadersToolInput,
  CheckTrustSignalsTool,
  type CheckTrustSignalsToolInput,
  CheckUrlStatusTool,
  type CheckUrlStatusToolInput,
  CreateAccountTool,
  CreateRecommendationTool,
  FetchRobotsTxtTool,
  type FetchRobotsTxtToolInput,
  FetchSitemapTool,
  type FetchSitemapToolInput,
  GoogleSerpTool,
  type GoogleSerpToolInput,
  InspectDomTool,
  PageSpeedTool,
  type PageSpeedToolInput,
  ScrapePageTool,
  type ScrapePageToolInput,
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
                input={part.input as PageSpeedToolInput}
                key={partId}
                output={part.output as PageSpeedOutput}
                state={part.state}
              />
            );

          case "tool-checkUrlStatus":
            return (
              <CheckUrlStatusTool
                input={part.input as CheckUrlStatusToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-fetchRobotsTxt":
            return (
              <FetchRobotsTxtTool
                input={part.input as FetchRobotsTxtToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-fetchSitemap":
            return (
              <FetchSitemapTool
                input={part.input as FetchSitemapToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-checkSecurityHeaders":
            return (
              <CheckSecurityHeadersTool
                input={part.input as CheckSecurityHeadersToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-checkTrustSignals":
            return (
              <CheckTrustSignalsTool
                input={part.input as CheckTrustSignalsToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-analyzePage":
            return (
              <AnalyzePageTool
                input={part.input as AnalyzePageToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-checkKeywordCannibalization":
            return (
              <CheckKeywordCannibalizationTool
                input={part.input as CheckKeywordCannibalizationToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-googleSerp":
            return (
              <GoogleSerpTool
                input={part.input as GoogleSerpToolInput}
                key={partId}
                state={part.state}
              />
            );

          case "tool-scrapePage":
            return (
              <ScrapePageTool
                input={part.input as ScrapePageToolInput}
                key={partId}
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
