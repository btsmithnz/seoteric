import type { ChatStatus, UIMessage } from "ai";
import {
  BriefcaseIcon,
  ChevronDownIcon,
  RadarIcon,
  WrenchIcon,
} from "lucide-react";
import type { PageSpeedOutput } from "@/ai/tools/pagespeed";
import type { CreateRecommendationOutput } from "@/ai/tools/recommendations";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
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

function SubagentTool({
  id,
  label,
  icon,
  part,
  status,
  isLast,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  part: { state: string; preliminary?: boolean; output?: unknown };
  status: ChatStatus;
  isLast: boolean;
}) {
  const isStreaming =
    part.state === "output-available" && part.preliminary === true;
  const isComplete = part.state === "output-available" && !part.preliminary;
  const nestedMessage = part.output as UIMessage | undefined;

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group flex w-full items-center gap-1.5 text-left text-gray-500 text-sm">
        <span className={cn(isStreaming && "animate-pulse")}>{icon}</span>
        <span>
          {isComplete
            ? `${label} complete`
            : `Running ${label.toLowerCase()}...`}
        </span>
        {(isStreaming || isComplete) && (
          <ChevronDownIcon className="ml-auto size-3.5 transition-transform group-data-[open]:rotate-180" />
        )}
      </CollapsibleTrigger>
      {nestedMessage && (
        <CollapsibleContent className="mt-1 border-gray-100 border-l-2 pl-3">
          <MessageRender
            id={id}
            isLast={isLast}
            message={nestedMessage}
            status={isStreaming ? "streaming" : status}
          />
        </CollapsibleContent>
      )}
    </Collapsible>
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
        const isLast = messageIdx === messages.length - 1;
        return (
          <Message from={message.role} key={messageId}>
            <MessageContent>
              {message.parts.map((part, idx) => {
                const partId = `${messageId}-${idx}`;
                const isLastPart = idx === message.parts.length - 1;

                switch (part.type) {
                  case "tool-businessReview":
                    return (
                      <SubagentTool
                        icon={<BriefcaseIcon className="inline size-4" />}
                        id={partId}
                        isLast={isLast && isLastPart}
                        key={partId}
                        label="Business Review"
                        part={part}
                        status={status}
                      />
                    );

                  case "tool-competitorAnalysis":
                    return (
                      <SubagentTool
                        icon={<RadarIcon className="inline size-4" />}
                        id={partId}
                        isLast={isLast && isLastPart}
                        key={partId}
                        label="Competitor Analysis"
                        part={part}
                        status={status}
                      />
                    );

                  case "tool-technicalAudit":
                    return (
                      <SubagentTool
                        icon={<WrenchIcon className="inline size-4" />}
                        id={partId}
                        isLast={isLast && isLastPart}
                        key={partId}
                        label="Technical Audit"
                        part={part}
                        status={status}
                      />
                    );

                  default:
                    return (
                      <MessageRender
                        id={partId}
                        isLast={isLast && isLastPart}
                        key={partId}
                        message={{ ...message, parts: [part] }}
                        status={status}
                      />
                    );
                }
              })}
            </MessageContent>
          </Message>
        );
      })}
    </>
  );
}
